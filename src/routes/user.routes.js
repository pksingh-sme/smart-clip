import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getUser, 
  getUserVideos, 
  subscribe, 
  unsubscribe, 
  getSubscribers, 
  getSubscriptions 
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Profile routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Public user routes
router.get('/:id', getUser);
router.get('/:id/subscribers', getSubscribers);
router.get('/:id/subscriptions', getSubscriptions);

// Subscription routes (require authentication)
router.post('/:id/subscribe', authenticate, subscribe);
router.delete('/:id/subscribe', authenticate, unsubscribe);

// User videos (require authentication)
router.get('/videos', authenticate, getUserVideos);

export default router;