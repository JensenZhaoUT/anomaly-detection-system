import { Router } from 'express';
import { getAllAnomalies, createNewAnomaly, getAnomaly } from '../controllers/anomalyController';

const router = Router();

router.get('/', getAllAnomalies);
router.post('/', createNewAnomaly);
router.get('/:id', getAnomaly);

export default router;