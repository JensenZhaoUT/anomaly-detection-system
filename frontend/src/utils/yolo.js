import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-wasm';

export const loadModel = async () => {
  await tf.setBackend('wasm');  // Set the backend to WASM for performance
  await tf.ready();
  return await cocoSsd.load();  // Load the pre-trained coco-ssd model
};

export const detectObjects = async (model, videoElement) => {
  const predictions = await model.detect(videoElement);
  if (predictions.length > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL('image/png');
    return { predictions, frame };
  }
  return { predictions: [], frame: null };
};
