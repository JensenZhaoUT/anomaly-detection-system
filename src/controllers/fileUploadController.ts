import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { detectAnomalies } from '../utils/anomalyDetection';
import { createAnomaly } from '../models/anomalyModel';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

export const uploadFile = upload.single('file');

export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    const anomalies = await detectAnomalies(filePath);
    for (const anomaly of anomalies) {
      await createAnomaly(anomaly);
    }
    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
