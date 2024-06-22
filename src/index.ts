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

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
