// health.js
import express from 'express';
import {
  getHealthRecord, addVaccine, updateVaccine, deleteVaccine,
  addDeworming, addMedicine, updateMedicine,
  addMilestone, deleteMilestone
} from '../controllers/healthController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getHealthRecord);
router.post('/vaccine', addVaccine);
router.put('/vaccine/:id', updateVaccine);
router.delete('/vaccine/:id', deleteVaccine);
router.post('/deworming', addDeworming);
router.post('/medicine', addMedicine);
router.put('/medicine/:id', updateMedicine);
router.post('/milestone', addMilestone);
router.delete('/milestone/:id', deleteMilestone);

export default router;
