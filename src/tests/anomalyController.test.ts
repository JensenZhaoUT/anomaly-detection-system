import request from 'supertest';
import express from 'express';
import anomalyRoutes from '../routes/anomalyRoutes';
import * as anomalyModel from '../models/anomalyModel';

const app = express();
app.use(express.json());
app.use('/api/anomalies', anomalyRoutes);

jest.mock('../models/anomalyModel');

describe('Anomaly Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all anomalies', async () => {
    const mockAnomalies = [{ id: 1, time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message', frame: 'frame_1.png' }];
    (anomalyModel.getAnomalies as jest.Mock).mockResolvedValue(mockAnomalies);

    const response = await request(app).get('/api/anomalies');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAnomalies);
  });

  it('should handle error when fetching all anomalies', async () => {
    (anomalyModel.getAnomalies as jest.Mock).mockRejectedValue(new Error('Failed to fetch anomalies'));

    const response = await request(app).get('/api/anomalies');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch anomalies' });
  });

  it('should create a new anomaly', async () => {
    const newAnomaly = { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message', frame: 'frame_1.png' };
    const savedAnomaly = { id: 1, ...newAnomaly };
    (anomalyModel.createAnomaly as jest.Mock).mockResolvedValue(savedAnomaly);

    const response = await request(app).post('/api/anomalies').send(newAnomaly);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedAnomaly);
  });

  it('should handle error when creating a new anomaly', async () => {
    (anomalyModel.createAnomaly as jest.Mock).mockRejectedValue(new Error('Failed to create anomaly'));

    const newAnomaly = { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message', frame: 'frame_1.png' };
    const response = await request(app).post('/api/anomalies').send(newAnomaly);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create anomaly' });
  });

  it('should fetch an anomaly by id', async () => {
    const mockAnomaly = { id: 1, time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message', frame: 'frame_1.png' };
    (anomalyModel.getAnomalyById as jest.Mock).mockResolvedValue(mockAnomaly);

    const response = await request(app).get('/api/anomalies/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAnomaly);
  });

  it('should return 404 if anomaly not found', async () => {
    (anomalyModel.getAnomalyById as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get('/api/anomalies/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Anomaly not found' });
  });

  it('should handle error when fetching anomaly by id', async () => {
    (anomalyModel.getAnomalyById as jest.Mock).mockRejectedValue(new Error('Failed to fetch anomaly'));

    const response = await request(app).get('/api/anomalies/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch anomaly' });
  });

  it('should save anomalies', async () => {
    const anomalies = [
      { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message 1', frame: 'frame_1.png' },
      { time: '2024-06-25T13:28:57.000Z', type: 'proximity_alert', message: 'Test message 2', frame: 'frame_2.png' }
    ];
    const savedAnomalies = [
      { id: 1, ...anomalies[0] },
      { id: 2, ...anomalies[1] }
    ];
    (anomalyModel.createAnomaly as jest.Mock)
      .mockResolvedValueOnce(savedAnomalies[0])
      .mockResolvedValueOnce(savedAnomalies[1]);

    const response = await request(app).post('/api/anomalies/save').send(anomalies);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedAnomalies);
  });

  it('should handle error when saving anomalies', async () => {
    (anomalyModel.createAnomaly as jest.Mock).mockRejectedValue(new Error('Failed to save anomalies'));

    const anomalies = [
      { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message 1', frame: 'frame_1.png' },
      { time: '2024-06-25T13:28:57.000Z', type: 'proximity_alert', message: 'Test message 2', frame: 'frame_2.png' }
    ];
    const response = await request(app).post('/api/anomalies/save').send(anomalies);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to save anomalies' });
  });
});
