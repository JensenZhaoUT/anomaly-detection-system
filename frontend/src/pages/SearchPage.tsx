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
  details: string;
}

const SearchPage = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
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

    fetchAnomalies();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

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
      <TextField label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />
      <Button variant="contained" color="primary" onClick={() => { /* Handle search logic */ }}>Search</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {anomalies.map((anomaly) => (
            <TableRow key={anomaly.id} onClick={() => setSelectedAnomaly(anomaly)}>
              <TableCell>{anomaly.time}</TableCell>
              <TableCell>{anomaly.type}</TableCell>
              <TableCell>{anomaly.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedAnomaly && (
        <Dialog open={!!selectedAnomaly} onClose={() => setSelectedAnomaly(null)}>
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
            <Button onClick={() => setSelectedAnomaly(null)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleFileUpload}>Upload</Button>
      {videoFile && (
        <div>
          <h2>Video</h2>
          <video width="600" controls>
            <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
          </video>
        </div>
      )}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Success"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            File uploaded successfully!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchPage;
