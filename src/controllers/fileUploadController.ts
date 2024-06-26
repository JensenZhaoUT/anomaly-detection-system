import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createAnomaly } from "../models/anomalyModel";

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const uploadFile = upload.single("file");

export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    res.status(200).json({ message: "File uploaded successfully", filePath });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

// Helper function to generate a unique filename with timestamp
const generateUniqueFilename = (baseName: string) => {
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date
    .getHours()
    .toString()
    .padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
  
  const extension = path.extname(baseName);
  const baseNameWithoutExt = path.basename(baseName, extension);
  return `${baseNameWithoutExt}_${timestamp}${extension}`;
};

export const saveUploadedAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = req.body;
    console.log("Received anomalies:", anomalies);
    const savedAnomalies = [];
    for (const anomaly of anomalies) {
      const newAnomaly = await createAnomaly(anomaly);
      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(anomaly.frame);

      // Save the frame image with the unique filename
      const framePath = path.join(__dirname, "../../images", uniqueFilename);
      console.log(`Saving image to: ${framePath}`);
      const base64Data = anomaly.frameData.replace(
        /^data:image\/png;base64,/,
        ""
      );

      // Log the base64Data length to confirm it's being received correctly
      console.log(`Base64 image data length: ${base64Data.length}`);

      fs.writeFileSync(framePath, base64Data, "base64");
      console.log(`Image saved to: ${framePath}`);

      // Update anomaly frame with unique filename before saving to the database
      newAnomaly.frame = uniqueFilename;
      savedAnomalies.push(newAnomaly);
      console.log("Saved anomaly with updated frame:", newAnomaly);
    }
    res.status(201).json(savedAnomalies);
  } catch (error) {
    console.error("Error saving anomalies:", error);
    res.status(500).json({ error: "Failed to save anomalies" });
  }
};
