import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';

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
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const response = await axios.get('/api/anomalies');
        setAnomalies(response.data);
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
      setDialogOpen(true);
      // Fetch anomalies again after upload
      const anomaliesResponse = await axios.get('/api/anomalies');
      setAnomalies(anomaliesResponse.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
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
              <p>Details: {selectedAnomaly.details}</p>
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
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleFileUpload}>Upload</Button>
      {videoFile && (
        <div>
          <h3>Video Preview:</h3>
          <video controls width="600" src={videoSrc}></video>
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
