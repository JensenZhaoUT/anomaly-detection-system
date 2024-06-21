import { Request, Response } from 'express';
import { getAnomalies, createAnomaly, getAnomalyById } from '../models/anomalyModel';

export const getAllAnomalies = async (req: Request, res: Response) => {
  try {
    const anomalies = await getAnomalies();
    res.status(200).json(anomalies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
};

export const createNewAnomaly = async (req: Request, res: Response) => {
  try {
    const newAnomaly = await createAnomaly(req.body);
    res.status(201).json(newAnomaly);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create anomaly' });
  }
};

export const getAnomaly = async (req: Request, res: Response) => {
  try {
    const anomaly = await getAnomalyById(req.params.id);
    if (anomaly) {
      res.status(200).json(anomaly);
    } else {
      res.status(404).json({ error: 'Anomaly not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anomaly' });
  }
};