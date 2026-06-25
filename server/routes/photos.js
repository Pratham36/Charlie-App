import express from 'express';
import multer from 'multer';
import { uploadPhoto, deletePhoto, getAllPhotos, viewPhoto } from '../controllers/photoController.js';
import { protect } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files allowed'), false);
    }
  },
});

const router = express.Router();

// Public route for viewing images (so standard <img> tags can load them without authorization headers)
router.get('/view/:driveId', viewPhoto);

// Protected routes below
router.use(protect);

router.get('/', getAllPhotos);
router.post('/upload', upload.single('photo'), uploadPhoto);
router.delete('/', deletePhoto);

export default router;
