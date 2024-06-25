import { Router } from 'express';
import { getAllAnomalies, createNewAnomaly, getAnomaly, saveAnomalies } from '../controllers/anomalyController';

const router = Router();

router.get('/', getAllAnomalies);
router.post('/', createNewAnomaly);
router.get('/:id', getAnomaly);
router.post('/save', saveAnomalies);  // Endpoint to save anomalies

export default router;
