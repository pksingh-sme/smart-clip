import express from 'express';
import { 
  getAllVideos, 
  moderateVideo, 
  getAllUsers, 
  moderateUser, 
  getStats 
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin authorization
router.use(authenticate, authorize('admin'));

// Video management
router.get('/videos', getAllVideos);
router.put('/videos/:id', moderateVideo);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', moderateUser);

// System statistics
router.get('/stats', getStats);

export default router;