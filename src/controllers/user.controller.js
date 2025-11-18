import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Subscription } from '../models/Subscription.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user.toJSON(),
  });
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, bio, profile_image_url } = req.body;
  
  // Check if email is being updated and if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }
  }

  // Update user
  const updatedUser = await User.update(req.user.id, {
    username,
    email,
    bio,
    profile_image_url,
  });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser.toJSON(),
  });
});

/**
 * Get public user profile
 * @route GET /api/users/:id
 * @access Public
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Get subscriber count
  const subscriberCount = await Subscription.getSubscriberCount(user.id);

  res.json({
    success: true,
    data: {
      ...user.toJSON(),
      subscriber_count: subscriberCount,
    },
  });
});

/**
 * Get user's videos
 * @route GET /api/users/videos
 * @access Private
 */
export const getUserVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const videos = await User.getVideos(req.user.id);
  
  res.json({
    success: true,
    data: videos,
  });
});

/**
 * Subscribe to a user
 * @route POST /api/users/:id/subscribe
 * @access Private
 */
export const subscribe = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  
  // Check if user is trying to subscribe to themselves
  if (targetUserId == req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'You cannot subscribe to yourself',
    });
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Create subscription
  const subscription = await Subscription.create({
    subscriber_id: req.user.id,
    subscribed_to_id: targetUserId,
  });

  if (!subscription) {
    return res.status(400).json({
      success: false,
      error: 'Already subscribed to this user',
    });
  }

  res.json({
    success: true,
    message: 'Subscribed successfully',
  });
});

/**
 * Unsubscribe from a user
 * @route DELETE /api/users/:id/subscribe
 * @access Private
 */
export const unsubscribe = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  
  // Check if user is trying to unsubscribe from themselves
  if (targetUserId == req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Invalid operation',
    });
  }

  // Delete subscription
  const result = await Subscription.delete(req.user.id, targetUserId);
  
  if (!result) {
    return res.status(400).json({
      success: false,
      error: 'Not subscribed to this user',
    });
  }

  res.json({
    success: true,
    message: 'Unsubscribed successfully',
  });
});

/**
 * Get user's subscribers
 * @route GET /api/users/:id/subscribers
 * @access Public
 */
export const getSubscribers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const subscribers = await Subscription.getSubscribers(req.params.id, page, limit);
  
  res.json({
    success: true,
    data: subscribers,
  });
});

/**
 * Get user's subscriptions
 * @route GET /api/users/:id/subscriptions
 * @access Public
 */
export const getSubscriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const subscriptions = await Subscription.getSubscriptions(req.params.id, page, limit);
  
  res.json({
    success: true,
    data: subscriptions,
  });
});