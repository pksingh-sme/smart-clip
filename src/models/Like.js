import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class Like {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.video_id = data.video_id;
    this.comment_id = data.comment_id;
    this.type = data.type; // 'like' or 'dislike'
    this.created_at = data.created_at;
  }

  /**
   * Create a new like/dislike
   * @param {Object} likeData - Like data
   * @returns {Like} Created like
   */
  static async create(likeData) {
    try {
      const result = await query(
        `INSERT INTO likes 
        (user_id, video_id, comment_id, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          likeData.user_id,
          likeData.video_id || null,
          likeData.comment_id || null,
          likeData.type
        ]
      );
      
      return new Like(result.rows[0]);
    } catch (error) {
      logger.error('Error creating like:', error);
      throw error;
    }
  }

  /**
   * Check if user has liked/disliked a video or comment
   * @param {number} userId - User ID
   * @param {number} targetId - Video ID or Comment ID
   * @param {string} targetType - 'video' or 'comment'
   * @returns {Like|null} Like object or null if not found
   */
  static async findByUserAndTarget(userId, targetId, targetType) {
    try {
      let queryText, values;
      
      if (targetType === 'video') {
        queryText = 'SELECT * FROM likes WHERE user_id = $1 AND video_id = $2';
        values = [userId, targetId];
      } else if (targetType === 'comment') {
        queryText = 'SELECT * FROM likes WHERE user_id = $1 AND comment_id = $2';
        values = [userId, targetId];
      } else {
        throw new Error('Invalid target type');
      }
      
      const result = await query(queryText, values);
      return result.rows.length > 0 ? new Like(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding like for user ${userId} and target ${targetId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a like/dislike
   * @param {number} userId - User ID
   * @param {number} targetId - Video ID or Comment ID
   * @param {string} targetType - 'video' or 'comment'
   * @returns {boolean} True if successful
   */
  static async deleteByUserAndTarget(userId, targetId, targetType) {
    try {
      let queryText, values;
      
      if (targetType === 'video') {
        queryText = 'DELETE FROM likes WHERE user_id = $1 AND video_id = $2 RETURNING id';
        values = [userId, targetId];
      } else if (targetType === 'comment') {
        queryText = 'DELETE FROM likes WHERE user_id = $1 AND comment_id = $2 RETURNING id';
        values = [userId, targetId];
      } else {
        throw new Error('Invalid target type');
      }
      
      const result = await query(queryText, values);
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error deleting like for user ${userId} and target ${targetId}:`, error);
      throw error;
    }
  }

  /**
   * Get like count for a video or comment
   * @param {number} targetId - Video ID or Comment ID
   * @param {string} targetType - 'video' or 'comment'
   * @param {string} type - 'like' or 'dislike'
   * @returns {number} Count of likes/dislikes
   */
  static async getCount(targetId, targetType, type) {
    try {
      let queryText, values;
      
      if (targetType === 'video') {
        queryText = 'SELECT COUNT(*) as count FROM likes WHERE video_id = $1 AND type = $2';
        values = [targetId, type];
      } else if (targetType === 'comment') {
        queryText = 'SELECT COUNT(*) as count FROM likes WHERE comment_id = $1 AND type = $2';
        values = [targetId, type];
      } else {
        throw new Error('Invalid target type');
      }
      
      const result = await query(queryText, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Error getting ${type} count for target ${targetId}:`, error);
      throw error;
    }
  }

  /**
   * Update a like/dislike
   * @param {number} id - Like ID
   * @param {Object} updateData - Data to update
   * @returns {Like} Updated like
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

      // Add ID to values array
      values.push(id);

      const queryText = `
        UPDATE likes 
        SET ${fields.join(', ')} 
        WHERE id = $${index} 
        RETURNING *`;

      const result = await query(queryText, values);
      return result.rows.length > 0 ? new Like(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error updating like ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert like object to JSON
   * @returns {Object} Like data
   */
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      video_id: this.video_id,
      comment_id: this.comment_id,
      type: this.type,
      created_at: this.created_at,
    };
  }
}
