import { Video } from '../models/Video.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Get recommended videos
 * @route GET /api/recommendations
 * @access Public
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  // In a real implementation, this would use AI/ML models to provide personalized recommendations
  // For now, we'll return trending videos or recently uploaded public videos
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // Get videos sorted by views count (trending)
  const result = await Video.getAll(page, limit, 'views_count', 'DESC');
  
  res.json({
    success: true,
    data: result,
  });
});

/**
 * Get trending videos
 * @route GET /api/trending
 * @access Public
 */
export const getTrending = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // Get videos sorted by views count (trending)
  const result = await Video.getAll(page, limit, 'views_count', 'DESC');
  
  res.json({
    success: true,
    data: result,
  });
});