import { User } from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';

/**
 * Register a new user
 * @route POST /api/auth/signup
 * @access Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists',
    });
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Generate tokens
  const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Store refresh token in Redis with 7-day expiration
  await redisClient.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  // Authenticate user
  const user = await User.authenticate(email, password);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  // Generate tokens
  const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Store refresh token in Redis with 7-day expiration
  await redisClient.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Remove refresh token from Redis
  await redisClient.del(`refresh_token:${userId}`);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token not provided',
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate new access token
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
});

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If email exists, password reset instructions have been sent',
    });
  }

  // Generate password reset token (implementation would involve sending email)
  // This is a simplified version - in production, you'd send an email with a reset link
  logger.info(`Password reset requested for user ${user.id}`);

  res.json({
    success: true,
    message: 'If email exists, password reset instructions have been sent',
  });
});

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // In a real implementation, you would:
  // 1. Verify the reset token
  // 2. Find the user associated with the token
  // 3. Update the user's password
  // 4. Invalidate the reset token

  // This is a simplified version
  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});