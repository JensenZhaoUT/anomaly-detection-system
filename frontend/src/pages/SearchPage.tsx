import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await axios.get('/api/anomalies');
      if (Array.isArray(response.data)) {
        setAnomalies(response.data);
      } else {
        console.error('API response is not an array', response.data);
      }
    } catch (error) {
      console.error('Error fetching anomalies', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/anomalies?search=${searchTerm}`);
      if (Array.isArray(response.data)) {
        setAnomalies(response.data);
      } else {
        console.error('API response is not an array', response.data);
      }
    } catch (error) {
      console.error('Error fetching anomalies', error);
    }
  };

  const handleRowClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!videoFile) return;
    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  return (
    <Container>
      <h1>Search Anomalies</h1>
      <TextField
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
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
          {anomalies.map((anomaly: any) => (
            <TableRow key={anomaly.id} onClick={() => handleRowClick(anomaly)}>
              <TableCell>{anomaly.time}</TableCell>
              <TableCell>{anomaly.type}</TableCell>
              <TableCell>{anomaly.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!selectedAnomaly} onClose={() => setSelectedAnomaly(null)}>
        <DialogTitle>Anomaly Details</DialogTitle>
        <DialogContent>
          {selectedAnomaly && (
            <div>
              <p>ID: {selectedAnomaly.id}</p>
              <p>Time: {selectedAnomaly.time}</p>
              <p>Type: {selectedAnomaly.type}</p>
              <p>Message: {selectedAnomaly.message}</p>
              <p>Frame: {selectedAnomaly.frame}</p>
              <p>Details: {selectedAnomaly.details}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAnomaly(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleFileUpload}>
        Upload
      </Button>
      {videoFile && (
        <div>
          <h2>Video</h2>
          <video width="600" controls>
            <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
