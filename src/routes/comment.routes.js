import express from 'express';
import { 
  addComment, 
  getComments, 
  updateComment, 
  deleteComment, 
  getReplies 
} from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Video comments routes
router.post('/videos/:videoId/comments', authenticate, addComment);
router.get('/videos/:videoId/comments', getComments);

// Individual comment routes
router.put('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);
router.get('/comments/:id/replies', getReplies);

export default router;