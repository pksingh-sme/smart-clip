import { Comment } from '../models/Comment.js';
import { Video } from '../models/Video.js';
import { Like } from '../models/Like.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Add a comment to a video
 * @route POST /api/videos/:videoId/comments
 * @access Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content, parent_id } = req.body;
  
  // Validate input
  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required',
    });
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Create comment
  const comment = await Comment.create({
    video_id: videoId,
    user_id: req.user.id,
    content,
    parent_id: parent_id || null,
  });

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment.toJSON(),
  });
});

/**
 * Get comments for a video
 * @route GET /api/videos/:videoId/comments
 * @access Public
 */
export const getComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  const result = await Comment.getByVideoId(videoId, page, limit);
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * Update a comment
 * @route PUT /api/comments/:id
 * @access Private
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  // Validate input
  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required',
    });
  }

  // Find comment
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  // Check if user owns the comment
  if (comment.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not own this comment.',
    });
  }

  // Update comment
  const updatedComment = await Comment.update(id, { content });
  
  if (!updatedComment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: updatedComment.toJSON(),
  });
});

/**
 * Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find comment
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  // Check if user owns the comment or is admin
  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not own this comment.',
    });
  }

  // Delete comment (soft delete)
  const result = await Comment.delete(id);
  
  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

/**
 * Get replies for a comment
 * @route GET /api/comments/:id/replies
 * @access Public
 */
export const getReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if comment exists
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  const replies = await Comment.getReplies(id);
  
  res.json({
    success: true,
    data: replies,
  });
});