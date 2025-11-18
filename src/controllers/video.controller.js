import { v4 as uuidv4 } from 'uuid';
import { Video } from '../models/Video.js';
import { Like } from '../models/Like.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

/**
 * Upload a new video
 * @route POST /api/videos
 * @access Private
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  // This is a simplified version - in production, you would:
  // 1. Handle file upload with multer or similar
  // 2. Process video (compress, generate thumbnails, etc.)
  // 3. Upload to cloud storage (S3, etc.)
  // 4. Save video metadata to database
  
  const { title, description, visibility } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'Title is required',
    });
  }

  // In a real implementation, you would get the video URL from the upload process
  const videoUrl = `https://example.com/videos/${uuidv4()}.mp4`;
  const thumbnailUrl = `https://example.com/thumbnails/${uuidv4()}.jpg`;
  
  // Create video record
  const video = await Video.create({
    user_id: req.user.id,
    title,
    description,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    visibility: visibility || 'public',
    status: 'processing', // Will be updated when processing is complete
  });

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: video.toJSON(),
  });
});

/**
 * Get all videos
 * @route GET /api/videos
 * @access Public
 */
export const getVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sortBy = req.query.sortBy || 'created_at';
  const sortOrder = req.query.sortOrder || 'DESC';
  
  const result = await Video.getAll(page, limit, sortBy, sortOrder);
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get a specific video
 * @route GET /api/videos/:id
 * @access Public
 */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Increment view count
  await Video.incrementViews(video.id);

  res.json({
    success: true,
    data: video.toJSON(),
  });
});

/**
 * Update a video
 * @route PUT /api/videos/:id
 * @access Private
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user owns the video
  if (video.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not own this video.',
    });
  }

  // Update video
  const updatedVideo = await Video.update(req.params.id, req.body);
  
  if (!updatedVideo) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  res.json({
    success: true,
    message: 'Video updated successfully',
    data: updatedVideo.toJSON(),
  });
});

/**
 * Delete a video
 * @route DELETE /api/videos/:id
 * @access Private
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user owns the video or is admin
  if (video.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not own this video.',
    });
  }

  // Delete video
  const result = await Video.delete(req.params.id);
  
  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  res.json({
    success: true,
    message: 'Video deleted successfully',
  });
});

/**
 * Search videos
 * @route GET /api/videos/search
 * @access Public
 */
export const searchVideos = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required',
    });
  }

  const result = await Video.search(q, page, limit);
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get video transcript
 * @route GET /api/videos/:id/transcript
 * @access Public
 */
export const getTranscript = asyncHandler(async (req, res) => {
  const languageCode = req.query.lang || 'en';
  
  const transcript = await Video.getTranscript(req.params.id, languageCode);
  
  if (!transcript) {
    return res.status(404).json({
      success: false,
      error: 'Transcript not found',
    });
  }

  res.json({
    success: true,
    data: transcript,
  });
});

/**
 * Add or update video transcript
 * @route POST /api/videos/:id/transcript
 * @access Private (admin or video owner)
 */
export const saveTranscript = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found',
    });
  }

  // Check if user owns the video or is admin
  if (video.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not own this video.',
    });
  }

  const { language_code, content } = req.body;
  
  if (!language_code || !content) {
    return res.status(400).json({
      success: false,
      error: 'Language code and content are required',
    });
  }

  const transcript = await Video.saveTranscript(req.params.id, language_code, content);
  
  res.json({
    success: true,
    message: 'Transcript saved successfully',
    data: transcript,
  });
});