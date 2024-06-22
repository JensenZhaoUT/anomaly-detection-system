import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

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
    // Perform anomaly detection here using the uploaded file
    // You can call a function that runs the ML model and returns results

    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
