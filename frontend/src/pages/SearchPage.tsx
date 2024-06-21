import React, { useState } from 'react';
import { Container, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anomalies, setAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/anomalies?search=${searchTerm}`);
      setAnomalies(response.data);
    } catch (error) {
      console.error('Error fetching anomalies', error);
    }
  };

  const handleRowClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
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
    </Container>
  );
};

export default SearchPage;
