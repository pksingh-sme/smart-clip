import express from 'express';
import { 
  likeVideo, 
  dislikeVideo, 
  likeComment, 
  getLikeStatus 
} from '../controllers/interaction.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Video interactions
router.post('/videos/:id/like', authenticate, likeVideo);
router.post('/videos/:id/dislike', authenticate, dislikeVideo);

// Comment interactions
router.post('/comments/:id/like', authenticate, likeComment);

// Get like status
router.get('/like-status', authenticate, getLikeStatus);

export default router;