import express from 'express';
import {
  getTrainingProfile, updateCommand, addCommand, updateProfile
} from '../controllers/trainingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getTrainingProfile);
router.put('/', updateProfile);
router.post('/command', addCommand);
router.put('/command/:id', updateCommand);

export default router;
