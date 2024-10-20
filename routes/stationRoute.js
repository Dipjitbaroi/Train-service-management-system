import express from 'express';
import { createStation, getAllStations } from '../controllers/stationController.js';

const router = express.Router();

router.post('/create', createStation);
router.get('/', getAllStations);

export default router;
