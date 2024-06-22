import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { Anomaly } from './types';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const detectAnomalies = async (filePath: string): Promise<Anomaly[]> => {
  await tf.ready();
  console.log('TensorFlow ready');
  const model = await cocoSsd.load();
  console.log('Model loaded');

  return new Promise((resolve, reject) => {
    const anomalies: Anomaly[] = [];
    const tempDir = './temp/';
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    ffmpeg(filePath)
      .on('end', async () => {
        const files = fs.readdirSync(tempDir);
        console.log('Frames extracted:', files);
        for (const file of files) {
          const framePath = path.join(tempDir, file);
          const img = fs.readFileSync(framePath);
          const imgTensor = tf.node.decodeImage(img) as tf.Tensor3D;
          const predictions = await model.detect(imgTensor);

          console.log('Predictions for frame', framePath, predictions);

          predictions.forEach(prediction => {
            const anomaly = {
              time: new Date().toISOString(),
              type: prediction.class,
              message: `Detected ${prediction.class}`,
              frame: framePath,
              details: JSON.stringify(prediction)
            };
            anomalies.push(anomaly);
            console.log('Anomaly detected:', anomaly);
          });

          fs.unlinkSync(framePath);
        }

        fs.rmdirSync(tempDir);
        resolve(anomalies);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('start', function(commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .screenshots({
        count: 5,
        folder: tempDir,
        size: '320x240'
      });
  });
};
