import { Request, Response } from "express";
import {
  getAnomalies,
  createAnomaly,
  getAnomalyById,
} from "../models/anomalyModel";

export const getAllAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = await getAnomalies();
    res.status(200).json(anomalies);
    console.log("Fetched anomalies:", anomalies);
  } catch (error) {
    console.error("Error fetching anomalies:", error);
    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
};

export const createNewAnomaly = async (req: Request, res: Response) => {
  try {
    const newAnomaly = await createAnomaly(req.body);
    res.status(201).json(newAnomaly);
    console.log("Created new anomaly:", newAnomaly);
  } catch (error) {
    console.error("Error creating anomaly:", error);
    res.status(500).json({ error: "Failed to create anomaly" });
  }
};

export const getAnomaly = async (req: Request, res: Response) => {
  try {
    const anomaly = await getAnomalyById(req.params.id);
    if (anomaly) {
      res.status(200).json(anomaly);
      console.log("Fetched anomaly:", anomaly);
    } else {
      res.status(404).json({ error: "Anomaly not found" });
    }
  } catch (error) {
    console.error("Error fetching anomaly:", error);
    res.status(500).json({ error: "Failed to fetch anomaly" });
  }
};

export const saveAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = req.body;
    console.log("Received anomalies:", anomalies);
    const savedAnomalies = [];
    for (const anomaly of anomalies) {
      const newAnomaly = await createAnomaly(anomaly);
      savedAnomalies.push(newAnomaly);
      console.log("Saved anomaly:", newAnomaly);
    }
    res.status(201).json(savedAnomalies);
    console.log("All anomalies saved:", savedAnomalies);
  } catch (error) {
    console.error("Error saving anomalies:", error);
    res.status(500).json({ error: "Failed to save anomalies" });
  }
};
