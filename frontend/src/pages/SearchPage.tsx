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

  