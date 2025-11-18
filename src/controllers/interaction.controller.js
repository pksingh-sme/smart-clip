import { Like } from '../models/Like.js';
import { Video } from '../models/Video.js';
import { Comment } from '../models/Comment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Like a video
 * @route POST /api/videos/:id/like
 * @access Private
 */
export const likeVideo = asyncHandler(async (req, res) => {
  const { id: videoId } = req.params;
  
  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user has already liked this video
  const existingLike = await Like.findByUserAndTarget(req.user.id, videoId, 'video');
  
  if (existingLike) {
    if (existingLike.type === 'like') {
      // User already liked, so remove the like
      await Like.deleteByUserAndTarget(req.user.id, videoId, 'video');
      
      // Decrement video likes count
      await Video.update(videoId, { likes_count: Math.max(0, video.likes_count - 1) });
      
      return res.json({
        success: true,
        message: 'Like removed',
      });
    } else {
      // User disliked, so change to like
      await Like.update(existingLike.id, { type: 'like' });
      
      // Increment video likes count and decrement dislikes count
      await Video.update(videoId, { 
        likes_count: video.likes_count + 1,
        dislikes_count: Math.max(0, video.dislikes_count - 1)
      });
      
      return res.json({
        success: true,
        message: 'Changed to like',
      });
    }
  }

  // Create new like
  await Like.create({
    user_id: req.user.id,
    video_id: videoId,
    type: 'like',
  });

  // Increment video likes count
  await Video.update(videoId, { likes_count: video.likes_count + 1 });

  res.json({
    success: true,
    message: 'Video liked',
  });
});

/**
 * Dislike a video
 * @route POST /api/videos/:id/dislike
 * @access Private
 */
export const dislikeVideo = asyncHandler(async (req, res) => {
  const { id: videoId } = req.params;
  
  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user has already disliked this video
  const existingLike = await Like.findByUserAndTarget(req.user.id, videoId, 'video');
  
  if (existingLike) {
    if (existingLike.type === 'dislike') {
      // User already disliked, so remove the dislike
      await Like.deleteByUserAndTarget(req.user.id, videoId, 'video');
      
      // Decrement video dislikes count
      await Video.update(videoId, { dislikes_count: Math.max(0, video.dislikes_count - 1) });
      
      return res.json({
        success: true,
        message: 'Dislike removed',
      });
    } else {
      // User liked, so change to dislike
      await Like.update(existingLike.id, { type: 'dislike' });
      
      // Increment video dislikes count and decrement likes count
      await Video.update(videoId, { 
        dislikes_count: video.dislikes_count + 1,
        likes_count: Math.max(0, video.likes_count - 1)
      });
      
      return res.json({
        success: true,
        message: 'Changed to dislike',
      });
    }
  }

  // Create new dislike
  await Like.create({
    user_id: req.user.id,
    video_id: videoId,
    type: 'dislike',
  });

  // Increment video dislikes count
  await Video.update(videoId, { dislikes_count: video.dislikes_count + 1 });

  res.json({
    success: true,
    message: 'Video disliked',
  });
});

/**
 * Like a comment
 * @route POST /api/comments/:id/like
 * @access Private
 */
export const likeComment = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;
  
  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found',
    });
  }

  // Check if user has already liked this comment
  const existingLike = await Like.findByUserAndTarget(req.user.id, commentId, 'comment');
  
  if (existingLike) {
    if (existingLike.type === 'like') {
      // User already liked, so remove the like
      await Like.deleteByUserAndTarget(req.user.id, commentId, 'comment');
      
      // Decrement comment likes count
      await Comment.update(commentId, { likes_count: Math.max(0, comment.likes_count - 1) });
      
      return res.json({
        success: true,
        message: 'Like removed',
      });
    } else {
      // User disliked, so change to like
      await Like.update(existingLike.id, { type: 'like' });
      
      // Increment comment likes count and decrement dislikes count
      await Comment.update(commentId, { 
        likes_count: comment.likes_count + 1,
        dislikes_count: Math.max(0, comment.dislikes_count - 1)
      });
      
      return res.json({
        success: true,
        message: 'Changed to like',
      });
    }
  }

  // Create new like
  await Like.create({
    user_id: req.user.id,
    comment_id: commentId,
    type: 'like',
  });

  // Increment comment likes count
  await Comment.update(commentId, { likes_count: comment.likes_count + 1 });

  res.json({
    success: true,
    message: 'Comment liked',
  });
});

/**
 * Get like status for video or comment
 * @route GET /api/interactions/like-status
 * @access Private
 */
export const getLikeStatus = asyncHandler(async (req, res) => {
  const { target_id, target_type } = req.query;
  
  if (!target_id || !target_type) {
    return res.status(400).json({
      success: false,
      error: 'target_id and target_type are required',
    });
  }

  if (target_type !== 'video' && target_type !== 'comment') {
    return res.status(400).json({
      success: false,
      error: 'target_type must be either "video" or "comment"',
    });
  }

  const like = await Like.findByUserAndTarget(req.user.id, target_id, target_type);
  
  res.json({
    success: true,
    data: {
      liked: like ? like.type === 'like' : false,
      disliked: like ? like.type === 'dislike' : false,
    },
  });
});