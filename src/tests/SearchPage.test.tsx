import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchPage from '../../frontend/src/pages/SearchPage';
import axios from 'axios';

jest.mock('axios');
jest.mock('@tensorflow/tfjs', () => ({
  loadGraphModel: jest.fn().mockResolvedValue({
    executeAsync: jest.fn().mockResolvedValue([
      { arraySync: jest.fn().mockReturnValue([]) },  // Mock for boxes
      { arraySync: jest.fn().mockReturnValue([]) },  // Mock for scores
      { arraySync: jest.fn().mockReturnValue([]) }   // Mock for classes
    ])
  }),
  setBackend: jest.fn().mockResolvedValue(true),
}));

describe('SearchPage', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('should render search page', async () => {
    await act(async () => {
      render(<SearchPage />);
    });
    expect(screen.getByText('Search Anomalies')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by Time')).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    await act(async () => {
      render(<SearchPage />);
    });

    const file = new File(['(⌐□_□)'], 'test-file.mp4', { type: 'video/mp4' });
    const input = screen.getByText('Upload Video').previousSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(input.files![0]).toEqual(file);
    expect(input.files!.length).toBe(1);
  });

  it('should filter anomalies based on search term', async () => {
    const mockAnomalies = [
      { id: 1, time: '2024-06-25T13:27:57.000Z', type: 'proximity_alert', message: 'Test message 1', frame: 'frame_1.png', frameData: 'data:image/png;base64,...' },
      { id: 2, time: '2024-06-25T13:28:57.000Z', type: 'proximity_alert', message: 'Test message 2', frame: 'frame_2.png', frameData: 'data:image/png;base64,...' }
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockAnomalies });

    await act(async () => {
      render(<SearchPage />);
    });

    await screen.findByText('Test message 1');

    fireEvent.change(screen.getByLabelText('Search by Time'), { target: { value: '13:27:57' } });
    fireEvent.click(screen.getByText('Search'));

    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.queryByText('Test message 2')).not.toBeInTheDocument();
  });

  it('should handle video processing', async () => {
    await act(async () => {
      render(<SearchPage />);
    });

    const file = new File(['(⌐□_□)'], 'test-file.mp4', { type: 'video/mp4' });
    const input = screen.getByText('Upload Video').previousSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const processButton = screen.getByText('Process Video');
    fireEvent.click(processButton);

    expect(await screen.findByText('Processing frame')).toBeInTheDocument();  // This message should be in your console.log
  });

  it('should handle errors in file upload', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Failed to upload'));
    await act(async () => {
      render(<SearchPage />);
    });

    const file = new File(['(⌐□_□)'], 'test-file.mp4', { type: 'video/mp4' });
    const input = screen.getByText('Upload Video').previousSibling as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    expect(await screen.findByText('Failed to upload')).toBeInTheDocument();  // Ensure this error message is part of your UI
  });

  it('should handle errors in anomaly fetching', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    await act(async () => {
      render(<SearchPage />);
    });

    expect(await screen.findByText('Failed to fetch anomalies')).toBeInTheDocument();  // Ensure this error message is part of your UI
  });
});
