import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class Comment {
  constructor(data) {
    this.id = data.id;
    this.video_id = data.video_id;
    this.user_id = data.user_id;
    this.parent_id = data.parent_id;
    this.content = data.content;
    this.likes_count = data.likes_count || 0;
    this.dislikes_count = data.dislikes_count || 0;
    this.is_deleted = data.is_deleted || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new comment
   * @param {Object} commentData - Comment data
   * @returns {Comment} Created comment
   */
  static async create(commentData) {
    try {
      const result = await query(
        `INSERT INTO comments 
        (video_id, user_id, parent_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          commentData.video_id,
          commentData.user_id,
          commentData.parent_id || null,
          commentData.content
        ]
      );
      
      return new Comment(result.rows[0]);
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Find comment by ID
   * @param {number} id - Comment ID
   * @returns {Comment|null} Comment or null if not found
   */
  static async findById(id) {
    try {
      const result = await query(
        `SELECT c.*, u.username as author_username 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = $1`,
        [id]
      );
      return result.rows.length > 0 ? new Comment(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding comment by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get comments for a video with pagination
   * @param {number} videoId - Video ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of comments per page (default: 20)
   * @returns {Object} Paginated comments
   */
  static async getByVideoId(videoId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await query(
        `SELECT c.*, u.username as author_username 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.video_id = $1 AND c.is_deleted = false
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [videoId, limit, offset]
      );
      
      const countResult = await query(
        'SELECT COUNT(*) as total FROM comments WHERE video_id = $1 AND is_deleted = false',
        [videoId]
      );
      
      return {
        comments: result.rows.map(row => new Comment(row)),
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      };
    } catch (error) {
      logger.error(`Error getting comments for video ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   * @param {number} parentId - Parent comment ID
   * @returns {Array} Array of reply comments
   */
  static async getReplies(parentId) {
    try {
      const result = await query(
        `SELECT c.*, u.username as author_username 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.parent_id = $1 AND c.is_deleted = false
         ORDER BY c.created_at ASC`,
        [parentId]
      );
      
      return result.rows.map(row => new Comment(row));
    } catch (error) {
      logger.error(`Error getting replies for comment ${parentId}:`, error);
      throw error;
    }
  }

  /**
   * Update comment
   * @param {number} id - Comment ID
   * @param {Object} updateData - Data to update
   * @returns {Comment} Updated comment
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
        UPDATE comments 
        SET ${fields.join(', ')} 
        WHERE id = $${index} 
        RETURNING *`;

      const result = await query(queryText, values);
      return result.rows.length > 0 ? new Comment(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error updating comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete comment (soft delete)
   * @param {number} id - Comment ID
   * @returns {boolean} True if successful
   */
  static async delete(id) {
    try {
      const result = await query(
        'UPDATE comments SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error deleting comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Increment comment likes count
   * @param {number} id - Comment ID
   * @returns {Comment} Updated comment
   */
  static async incrementLikes(id) {
    try {
      const result = await query(
        'UPDATE comments SET likes_count = likes_count + 1, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows.length > 0 ? new Comment(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error incrementing likes for comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Decrement comment likes count
   * @param {number} id - Comment ID
   * @returns {Comment} Updated comment
   */
  static async decrementLikes(id) {
    try {
      const result = await query(
        'UPDATE comments SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows.length > 0 ? new Comment(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error decrementing likes for comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert comment object to JSON
   * @returns {Object} Comment data
   */
  toJSON() {
    return {
      id: this.id,
      video_id: this.video_id,
      user_id: this.user_id,
      parent_id: this.parent_id,
      content: this.content,
      likes_count: this.likes_count,
      dislikes_count: this.dislikes_count,
      is_deleted: this.is_deleted,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}