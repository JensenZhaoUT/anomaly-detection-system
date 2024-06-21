import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import anomalyRoutes from './routes/anomalyRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/anomalies', anomalyRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});