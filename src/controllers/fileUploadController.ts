import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
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
    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const saveAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = req.body;
    console.log('Received anomalies:', anomalies);
    const savedAnomalies = [];
    for (const anomaly of anomalies) {
      // Convert time to EST
      anomaly.time = moment(anomaly.time).tz('America/Toronto').format();
      
      const newAnomaly = await createAnomaly(anomaly);
      savedAnomalies.push(newAnomaly);
      console.log('Saved anomaly:', newAnomaly);

      // Save the frame image
      const framePath = path.join(__dirname, '../../images', anomaly.frame);
      const base64Data = anomaly.frameData.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(framePath, base64Data, 'base64');
    }
    res.status(201).json(savedAnomalies);
  } catch (error) {
    console.error('Error saving anomalies:', error);
    res.status(500).json({ error: 'Failed to save anomalies' });
  }
};
