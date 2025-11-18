import express from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;