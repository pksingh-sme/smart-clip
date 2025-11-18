import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Comment } from '../models/Comment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { query } from '../config/database.js';

/**
 * Get all videos (admin)
 * @route GET /api/admin/videos
 * @access Private (Admin only)
 */
export const getAllVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status; // optional filter
  
  let query = `
    SELECT v.*, u.username as creator_username 
    FROM videos v 
    JOIN users u ON v.user_id = u.id
  `;
  
  const values = [];
  if (status) {
    query += ` WHERE v.status = $1`;
    values.push(status);
  }
  
  query += ` ORDER BY v.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, (page - 1) * limit);
  
  const result = await query(query, values);
  
  res.json({
    success: true,
    data: result.rows,
  });
});

/**
 * Moderate a video (admin)
 * @route PUT /api/admin/videos/:id
 * @access Private (Admin only)
 */
export const moderateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, visibility } = req.body;
  
  // Find video
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Update video
  const updateData = {};
  if (status) updateData.status = status;
  if (visibility) updateData.visibility = visibility;
  
  const updatedVideo = await Video.update(id, updateData);
  
  if (!updatedVideo) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  res.json({
    success: true,
    message: 'Video moderated successfully',
    data: updatedVideo.toJSON(),
  });
});

/**
 * Get all users (admin)
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const role = req.query.role; // optional filter
  
  let query = `SELECT * FROM users`;
  const values = [];
  
  if (role) {
    query += ` WHERE role = $1`;
    values.push(role);
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, (page - 1) * limit);
  
  const result = await query(query, values);
  
  res.json({
    success: true,
    data: result.rows,
  });
});

/**
 * Moderate a user (admin)
 * @route PUT /api/admin/users/:id
 * @access Private (Admin only)
 */
export const moderateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active, role } = req.body;
  
  // Find user
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Update user
  const updateData = {};
  if (is_active !== undefined) updateData.is_active = is_active;
  if (role) updateData.role = role;
  
  const updatedUser = await User.update(id, updateData);
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    message: 'User moderated successfully',
    data: updatedUser.toJSON(),
  });
});

/**
 * Get system statistics (admin)
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
export const getStats = asyncHandler(async (req, res) => {
  // Get total counts
  const userCount = await query('SELECT COUNT(*) as count FROM users');
  const videoCount = await query('SELECT COUNT(*) as count FROM videos');
  const commentCount = await query('SELECT COUNT(*) as count FROM comments');
  
  // Get recent activity
  const recentUsers = await query(`
    SELECT id, username, email, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 10
  `);
  
  const recentVideos = await query(`
    SELECT v.id, v.title, v.created_at, u.username as creator
    FROM videos v
    JOIN users u ON v.user_id = u.id
    ORDER BY v.created_at DESC 
    LIMIT 10
  `);
  
  res.json({
    success: true,
    data: {
      totals: {
        users: parseInt(userCount.rows[0].count),
        videos: parseInt(videoCount.rows[0].count),
        comments: parseInt(commentCount.rows[0].count),
      },
      recent: {
        users: recentUsers.rows,
        videos: recentVideos.rows,
      },
    },
  });
});