import express from 'express';
import { 
  uploadVideo, 
  getVideos, 
  getVideo, 
  updateVideo, 
  deleteVideo, 
  searchVideos, 
  getTranscript, 
  saveTranscript 
} from '../controllers/video.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', getVideos);
router.get('/search', searchVideos);
router.get('/:id', getVideo);
router.get('/:id/transcript', getTranscript);

// Protected routes
router.post('/', authenticate, uploadRateLimiter, uploadVideo);
router.put('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/transcript', authenticate, saveTranscript);

export default router;