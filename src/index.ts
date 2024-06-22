import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import anomalyRoutes from './routes/anomalyRoutes';
import fileUploadRoutes from './routes/fileUploadRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/anomalies', anomalyRoutes);
app.use('/api/files', fileUploadRoutes);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve .wasm files with correct MIME type
app.get('/static/js/*.wasm', (req, res, next) => {
  const filePath = path.join(__dirname, '../frontend/public/static/js', path.basename(req.path));
  res.type('application/wasm');
  res.sendFile(filePath);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
