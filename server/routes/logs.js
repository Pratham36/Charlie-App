import express from 'express';
import {
  getLogs, getTodayLog, getLog,
  createLog, updateLog, deleteLog, getStatsSummary
} from '../controllers/logController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats/summary', getStatsSummary);
router.get('/today', getTodayLog);
router.get('/', getLogs);
router.get('/:id', getLog);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

export default router;
