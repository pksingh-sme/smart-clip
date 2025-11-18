import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class Video {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.video_url = data.video_url;
    this.thumbnail_url = data.thumbnail_url;
    this.duration = data.duration;
    this.visibility = data.visibility || 'public';
    this.status = data.status || 'processing';
    this.views_count = data.views_count || 0;
    this.likes_count = data.likes_count || 0;
    this.dislikes_count = data.dislikes_count || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new video
   * @param {Object} videoData - Video data
   * @returns {Video} Created video
   */
  static async create(videoData) {
    try {
      const result = await query(
        `INSERT INTO videos 
        (user_id, title, description, video_url, thumbnail_url, duration, visibility, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          videoData.user_id,
          videoData.title,
          videoData.description,
          videoData.video_url,
          videoData.thumbnail_url,
          videoData.duration,
          videoData.visibility || 'public',
          videoData.status || 'processing'
        ]
      );
      
      return new Video(result.rows[0]);
    } catch (error) {
      logger.error('Error creating video:', error);
      throw error;
    }
  }

  /**
   * Find video by ID
   * @param {number} id - Video ID
   * @returns {Video|null} Video or null if not found
   */
  static async findById(id) {
    try {
      const result = await query(
        `SELECT v.*, u.username as creator_username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.id = $1`,
        [id]
      );
      return result.rows.length > 0 ? new Video(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding video by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find videos by user ID
   * @param {number} userId - User ID
   * @returns {Array} Array of videos
   */
  static async findByUserId(userId) {
    try {
      const result = await query(
        `SELECT v.*, u.username as creator_username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.user_id = $1 
         ORDER BY v.created_at DESC`,
        [userId]
      );
      return result.rows.map(row => new Video(row));
    } catch (error) {
      logger.error(`Error finding videos by user ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all videos with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of videos per page (default: 20)
   * @param {string} sortBy - Sort field (default: 'created_at')
   * @param {string} sortOrder - Sort order (default: 'DESC')
   * @returns {Object} Paginated videos
   */
  static async getAll(page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC') {
    try {
      const offset = (page - 1) * limit;
      
      // Validate sort parameters
      const validSortFields = ['created_at', 'views_count', 'likes_count'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (!validSortFields.includes(sortBy)) {
        sortBy = 'created_at';
      }
      
      if (!validSortOrders.includes(sortOrder)) {
        sortOrder = 'DESC';
      }
      
      const result = await query(
        `SELECT v.*, u.username as creator_username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.visibility = 'public' AND v.status = 'available'
         ORDER BY v.${sortBy} ${sortOrder}
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      const countResult = await query(
        'SELECT COUNT(*) as total FROM videos WHERE visibility = $1 AND status = $2',
        ['public', 'available']
      );
      
      return {
        videos: result.rows.map(row => new Video(row)),
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      };
    } catch (error) {
      logger.error('Error getting all videos:', error);
      throw error;
    }
  }

  /**
   * Search videos by title or description
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of videos per page (default: 20)
   * @returns {Object} Paginated search results
   */
  static async search(searchTerm, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await query(
        `SELECT v.*, u.username as creator_username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.visibility = 'public' 
         AND v.status = 'available'
         AND (v.title ILIKE $1 OR v.description ILIKE $1)
         ORDER BY v.created_at DESC
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      );
      
      const countResult = await query(
        `SELECT COUNT(*) as total 
         FROM videos v 
         WHERE v.visibility = 'public' 
         AND v.status = 'available'
         AND (v.title ILIKE $1 OR v.description ILIKE $1)`,
        [`%${searchTerm}%`]
      );
      
      return {
        videos: result.rows.map(row => new Video(row)),
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      };
    } catch (error) {
      logger.error(`Error searching videos for term "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Update video
   * @param {number} id - Video ID
   * @param {Object} updateData - Data to update
   * @returns {Video} Updated video
   */
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic query based on provided fields
      for (const [key, value] of Object.entries(updateData)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }

      // Add updated_at timestamp
      fields.push(`updated_at = NOW()`);
      
      // Add ID to values array
      values.push(id);

      const queryText = `
        UPDATE videos 
        SET ${fields.join(', ')} 
        WHERE id = $${index} 
        RETURNING *`;

      const result = await query(queryText, values);
      return result.rows.length > 0 ? new Video(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error updating video ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete video
   * @param {number} id - Video ID
   * @returns {boolean} True if successful
   */
  static async delete(id) {
    try {
      const result = await query('DELETE FROM videos WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error deleting video ${id}:`, error);
      throw error;
    }
  }

  /**
   * Increment video views count
   * @param {number} id - Video ID
   * @returns {Video} Updated video
   */
  static async incrementViews(id) {
    try {
      const result = await query(
        'UPDATE videos SET views_count = views_count + 1, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows.length > 0 ? new Video(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error incrementing views for video ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get video transcript
   * @param {number} videoId - Video ID
   * @param {string} languageCode - Language code (default: 'en')
   * @returns {Object|null} Transcript or null if not found
   */
  static async getTranscript(videoId, languageCode = 'en') {
    try {
      const result = await query(
        'SELECT * FROM video_transcripts WHERE video_id = $1 AND language_code = $2',
        [videoId, languageCode]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error(`Error getting transcript for video ${videoId} in language ${languageCode}:`, error);
      throw error;
    }
  }

  /**
   * Add or update video transcript
   * @param {number} videoId - Video ID
   * @param {string} languageCode - Language code
   * @param {string} content - Transcript content
   * @returns {Object} Transcript
   */
  static async saveTranscript(videoId, languageCode, content) {
    try {
      const result = await query(
        `INSERT INTO video_transcripts (video_id, language_code, content)
         VALUES ($1, $2, $3)
         ON CONFLICT (video_id, language_code)
         DO UPDATE SET content = $3, updated_at = NOW()
         RETURNING *`,
        [videoId, languageCode, content]
      );
      return result.rows[0];
    } catch (error) {
      logger.error(`Error saving transcript for video ${videoId} in language ${languageCode}:`, error);
      throw error;
    }
  }

  /**
   * Convert video object to JSON
   * @returns {Object} Video data
   */
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      video_url: this.video_url,
      thumbnail_url: this.thumbnail_url,
      duration: this.duration,
      visibility: this.visibility,
      status: this.status,
      views_count: this.views_count,
      likes_count: this.likes_count,
      dislikes_count: this.dislikes_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}