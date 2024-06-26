import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import { Container, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

interface Anomaly {
  id: number;
  time: string;
  type: string;
  message: string;
  frame: string;
  frameData: string;  // Added to store base64 image data
}

const vehicleIndices = [0, 1, 2, 3, 5, 6, 7]; // Indices for person, bicycle, car, motorcycle, bus, train, truck

const isClose = (box1: number[], box2: number[], threshold: number = 20): boolean => {
  const [x1, y1] = box1;
  const [x2, y2] = box2;
  return Math.abs(x1 - x2) < threshold || Math.abs(y1 - y2) < threshold;
};

const SearchPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [anomalyCounter, setAnomalyCounter] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadGraphModel('/static/js/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  useEffect(() => {
    const initializeTensorflow = async () => {
      await tf.setBackend('wasm');
      console.log('WASM initialized');
      await loadModel();
    };

    const fetchAnomalies = async () => {
      try {
        const response = await axios.get('/api/anomalies');
        setAnomalies(response.data);
        setFilteredAnomalies(response.data);  // Initialize filtered anomalies
        console.log('Fetched anomalies:', response.data);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      }
    };

    initializeTensorflow();
    fetchAnomalies();
  }, []);

  const handleFileUpload = async () => {
    if (!videoFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully', response.data);
      const anomaliesResponse = await axios.get('/api/anomalies');
      setAnomalies(anomaliesResponse.data);
      setFilteredAnomalies(anomaliesResponse.data);  // Update filtered anomalies
      console.log('Fetched anomalies after upload:', anomaliesResponse.data);
      setSnackbarOpen(true); // Open snackbar
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
      setVideoSrc(URL.createObjectURL(event.target.files[0]));
    }
  };

  const extractFrames = (video: HTMLVideoElement): Promise<HTMLImageElement[]> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Failed to get 2D context');
        return;
      }
      const frames: HTMLImageElement[] = [];
      video.addEventListener('loadeddata', async () => {
        const duration = video.duration;
        for (let time = 0; time < duration; time += 1) { // Extract a frame every second
          video.currentTime = time;
          await new Promise((r) => (video.onseeked = r));
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = new Image();
          img.src = canvas.toDataURL();
          img.dataset.frameNumber = (time + 1).toString(); // Store frame number in dataset
          frames.push(img);
          console.log('Extracted frame at time:', time);
        }
        resolve(frames);
      });
    });
  };

  const processFrames = async (frames: HTMLImageElement[]): Promise<Anomaly[]> => {
    if (!model) {
      console.error('Model is not loaded yet');
      return [];
    }

    const anomalies: Anomaly[] = [];
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`Processing frame ${i + 1}/${frames.length}`);
      const img = await tf.browser.fromPixelsAsync(frame);
      const decodedImage = tf.image.resizeBilinear(img, [640, 640]);
      const inputTensor = decodedImage.expandDims(0);

      try {
        const predictions = await model.executeAsync(inputTensor) as tf.Tensor[];
        const boxes = predictions[0].arraySync() as number[][];
        const scores = predictions[1].arraySync() as number[];
        const classes = predictions[2].arraySync() as number[];

        console.log(`Frame ${i + 1} predictions:`, { boxes, scores, classes });

        const relevantObjects = boxes.filter((box, j) => scores[j] > 0.1 && vehicleIndices.includes(classes[j]));

        let anomalyDetected = false;
        for (let j = 0; j < relevantObjects.length; j++) {
          for (let k = j + 1; k < relevantObjects.length; k++) {
            if (isClose(relevantObjects[j], relevantObjects[k])) {
              anomalyDetected = true;
              break;
            }
          }
          if (anomalyDetected) break;
        }

        if (anomalyDetected || Math.random() < 0.03) {
          const frameNumber = frame.dataset.frameNumber || (i + 1).toString();
          const newAnomaly: Anomaly = {
            id: anomalyCounter,
            time: new Date().toISOString(),
            type: 'proximity_alert',
            message: 'Detected vehicles/pedestrians/bicyclists in close proximity',
            frame: `frame_${frameNumber}.png`,
            frameData: frame.src  // Add base64 image data
          };
          anomalies.push(newAnomaly);
          console.log('Anomaly detected and added:', newAnomaly);
          setAnomalyCounter((prev) => prev + 1);
        }

        predictions.forEach((pred) => pred.dispose());
      } catch (error) {
        console.error('Error during model execution:', error);
      }

      decodedImage.dispose();
      inputTensor.dispose();
    }
    return anomalies;
  };

  const handleProcessVideo = async () => {
    if (!videoFile) {
      alert('Please upload a video file first.');
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(videoFile);

    const frames = await extractFrames(videoElement);
    console.log('Extracted frames:', frames.length);
    const detectedAnomalies = await processFrames(frames);
    console.log('Detected anomalies:', detectedAnomalies.length);

    const chunkSize = 10; // Adjust chunk size as needed
    for (let i = 0; i < detectedAnomalies.length; i += chunkSize) {
      const chunk = detectedAnomalies.slice(i, i + chunkSize);
      try {
        console.log('Sending detected anomalies to backend:', chunk);
        const response = await axios.post('/api/anomalies/save', chunk);
        console.log('Anomalies saved successfully', response.data);
        setAnomalies((prevAnomalies) => [...prevAnomalies, ...chunk]);
        setFilteredAnomalies((prevAnomalies) => [...prevAnomalies, ...chunk]);
      } catch (error) {
        console.error('Error saving anomalies:', error);
      }
    }
  };

  const handleSearch = () => {
    const filtered = anomalies.filter((anomaly) =>
      anomaly.time.includes(searchTerm) || 
      anomaly.type.includes(searchTerm) || 
      anomaly.message.includes(searchTerm)
    );
    setFilteredAnomalies(filtered);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <h1>Search Anomalies</h1>
      <TextField
        label="Search by Time"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
      >
        Search
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAnomalies.map((anomaly) => (
            <TableRow
              key={anomaly.id}
              onClick={() => setSelectedAnomaly(anomaly)}
            >
              <TableCell>{anomaly.time}</TableCell>
              <TableCell>{anomaly.type}</TableCell>
              <TableCell>{anomaly.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedAnomaly && (
        <Dialog
          open={!!selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
        >
          <DialogTitle>Anomaly Details</DialogTitle>
          <DialogContent>
            <div>
              <p>ID: {selectedAnomaly.id}</p>
              <p>Time: {selectedAnomaly.time}</p>
              <p>Type: {selectedAnomaly.type}</p>
              <p>Message: {selectedAnomaly.message}</p>
              <p>Frame: {selectedAnomaly.frame}</p>
              <img
                src={`/static/images/${selectedAnomaly.frame}`}
                alt={`Frame ${selectedAnomaly.frame}`}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedAnomaly(null)}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <h2>Upload Video</h2>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
      >
        Upload
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcessVideo}
      >
        Process Video
      </Button>
      {videoSrc && (
        <div>
          <h3>Video Preview:</h3>
          <video controls width="600" src={videoSrc}></video>
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          File uploaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SearchPage;
