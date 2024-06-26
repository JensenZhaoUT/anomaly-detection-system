import request from 'supertest';
import express from 'express';
import fileUploadRoutes from '../routes/fileUploadRoutes';
import fs from 'fs';
import path from 'path';
import * as anomalyModel from '../models/anomalyModel';

const app = express();
app.use(express.json());
app.use('/api/files', fileUploadRoutes);

jest.mock('fs');
jest.mock('path');
jest.mock('../models/anomalyModel');

describe('File Upload Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a file successfully', async () => {
    const filePath = '/uploads/test-file.txt';
    (path.join as jest.Mock).mockReturnValue(filePath);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    const response = await request(app)
      .post('/api/files/upload')
      .attach('file', Buffer.from('test content'), 'test-file.txt');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'File uploaded successfully', filePath });
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(Buffer));
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app).post('/api/files/upload');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No file uploaded' });
  });

  it('should handle error during file upload', async () => {
    const filePath = '/uploads/test-file.txt';
    (path.join as jest.Mock).mockReturnValue(filePath);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to write file');
    });

    const response = await request(app)
      .post('/api/files/upload')
      .attach('file', Buffer.from('test content'), 'test-file.txt');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to upload file' });
  });

  it('should save anomalies with frames', async () => {
    const anomalies = [
      { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message 1', frame: 'frame_1.png', frameData: 'data:image/png;base64,frameData1' },
      { time: '2024-06-25T13:28:57.000Z', type: 'proximity_alert', message: 'Test message 2', frame: 'frame_2.png', frameData: 'data:image/png;base64,frameData2' }
    ];
    const savedAnomalies = [
      { id: 1, ...anomalies[0] },
      { id: 2, ...anomalies[1] }
    ];
    (path.join as jest.Mock)
      .mockReturnValueOnce('/images/frame_1_2024-06-25_13-27-57.png')
      .mockReturnValueOnce('/images/frame_2_2024-06-25_13-28-57.png');
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (anomalyModel.createAnomaly as jest.Mock)
      .mockResolvedValueOnce(savedAnomalies[0])
      .mockResolvedValueOnce(savedAnomalies[1]);

    const response = await request(app).post('/api/anomalies/save').send(anomalies);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedAnomalies);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync).toHaveBeenCalledWith('/images/frame_1_2024-06-25_13-27-57.png', expect.any(String), 'base64');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/images/frame_2_2024-06-25_13-28-57.png', expect.any(String), 'base64');
  });

  it('should handle error when saving anomalies with frames', async () => {
    (anomalyModel.createAnomaly as jest.Mock).mockRejectedValue(new Error('Failed to save anomalies'));
    const anomalies = [
      { time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message 1', frame: 'frame_1.png', frameData: 'data:image/png;base64,frameData1' },
      { time: '2024-06-25T13:28:57.000Z', type: 'proximity_alert', message: 'Test message 2', frame: 'frame_2.png', frameData: 'data:image/png;base64,frameData2' }
    ];
    const response = await request(app).post('/api/anomalies/save').send(anomalies);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to save anomalies' });
  });
});
