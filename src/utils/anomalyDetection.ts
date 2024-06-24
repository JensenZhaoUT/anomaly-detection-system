import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';

type Anomaly = {
  time: string;
  type: string;
  message: string;
  frame: string;
  details: string;
};

const vehicleIndices = [0, 1, 2, 3, 4, 5, 6, 7,8,9,10,11,12,13,14]; // Indices for person, bicycle, car, motorcycle, bus, train, truck

const isClose = (box1: number[], box2: number[], threshold: number = 20) => {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;
  return Math.abs(x1 - x2) < threshold && Math.abs(y1 - y2) < threshold;
};

const detectAnomalies = async (filePath: string) => {
  const modelPath = path.join(__dirname, 'model.json');
  console.log('Model Path:', modelPath); // Log the model path
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model file not found at path: ${modelPath}`);
  }
  const model = await tf.loadGraphModel(`file://${modelPath}`);
  
  // FFmpeg command to extract frames every second
  const framesDir = 'temp';
  if (!fs.existsSync(framesDir)){
    fs.mkdirSync(framesDir);
  }

  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions('-vf', 'fps=1') // Extract 1 frame per second
      .output(path.join(framesDir, 'frame_%04d.png'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const anomalies: Anomaly[] = [];
  
  const frames = fs.readdirSync(framesDir);
  for (const frame of frames) {
    console.log(`Processing frame: ${frame}`);
    const img = fs.readFileSync(path.join(framesDir, frame));
    let decodedImage = tf.node.decodeImage(img, 3);
    decodedImage = tf.image.resizeBilinear(decodedImage, [640, 640]); // Resize image to [640, 640]

    const inputTensor = decodedImage.expandDims(0);

    console.log(`Input tensor shape: ${inputTensor.shape}`);
    const predictions = await model.executeAsync(inputTensor) as tf.Tensor[];
    console.log('Predictions:', predictions.map(pred => pred.arraySync()));

    const boxes = predictions[0].arraySync() as number[][];
    const scores = predictions[1].arraySync() as number[];
    const classes = predictions[2].arraySync() as number[];

    // Filter predictions for vehicles/pedestrians with a certain confidence score
    const relevantObjects = boxes.filter((box, i) => scores[i] > 0.05 && vehicleIndices.includes(classes[i]));
    console.log('Relevant objects:', relevantObjects);

    for (let i = 0; i < relevantObjects.length; i++) {
      for (let j = i + 1; j < relevantObjects.length; j++) {
        if (isClose(relevantObjects[i], relevantObjects[j])) {
          console.log(`Anomaly detected between objects ${i} and ${j}`);
          anomalies.push({
            time: new Date().toISOString(),
            type: 'proximity_alert',
            message: 'Detected vehicles/pedestrians/bicyclists in close proximity',
            frame: frame,
            details: JSON.stringify({ bbox1: relevantObjects[i], bbox2: relevantObjects[j] })
          });
        }
      }
    }

    decodedImage.dispose();
    inputTensor.dispose();
    predictions.forEach(pred => pred.dispose());
  }

  // Clean up frames
  frames.forEach(frame => fs.unlinkSync(path.join(framesDir, frame)));

  return anomalies;
};

export { detectAnomalies, Anomaly };
