import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

export class Subscription {
  constructor(data) {
    this.id = data.id;
    this.subscriber_id = data.subscriber_id;
    this.subscribed_to_id = data.subscribed_to_id;
    this.created_at = data.created_at;
  }

  /**
   * Create a new subscription
   * @param {Object} subscriptionData - Subscription data
   * @returns {Subscription} Created subscription
   */
  static async create(subscriptionData) {
    try {
      const result = await query(
        `INSERT INTO subscriptions 
        (subscriber_id, subscribed_to_id)
        VALUES ($1, $2)
        ON CONFLICT (subscriber_id, subscribed_to_id) 
        DO NOTHING
        RETURNING *`,
        [
          subscriptionData.subscriber_id,
          subscriptionData.subscribed_to_id
        ]
      );
      
      return result.rows.length > 0 ? new Subscription(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to another user
   * @param {number} subscriberId - Subscriber user ID
   * @param {number} subscribedToId - User being subscribed to
   * @returns {Subscription|null} Subscription object or null if not found
   */
  static async findBySubscriberAndTarget(subscriberId, subscribedToId) {
    try {
      const result = await query(
        'SELECT * FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2',
        [subscriberId, subscribedToId]
      );
      
      return result.rows.length > 0 ? new Subscription(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding subscription between ${subscriberId} and ${subscribedToId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   * @param {number} subscriberId - Subscriber user ID
   * @param {number} subscribedToId - User being subscribed to
   * @returns {boolean} True if successful
   */
  static async delete(subscriberId, subscribedToId) {
    try {
      const result = await query(
        'DELETE FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2 RETURNING id',
        [subscriberId, subscribedToId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error deleting subscription between ${subscriberId} and ${subscribedToId}:`, error);
      throw error;
    }
  }

  /**
   * Get subscribers for a user
   * @param {number} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of subscribers per page (default: 20)
   * @returns {Object} Paginated subscribers
   */
  static async getSubscribers(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await query(
        `SELECT s.*, u.username as subscriber_username, u.profile_image_url as subscriber_profile_image
         FROM subscriptions s
         JOIN users u ON s.subscriber_id = u.id
         WHERE s.subscribed_to_id = $1
         ORDER BY s.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      const countResult = await query(
        'SELECT COUNT(*) as total FROM subscriptions WHERE subscribed_to_id = $1',
        [userId]
      );
      
      return {
        subscribers: result.rows.map(row => new Subscription(row)),
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      };
    } catch (error) {
      logger.error(`Error getting subscribers for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get subscriptions for a user
   * @param {number} userId - User ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of subscriptions per page (default: 20)
   * @returns {Object} Paginated subscriptions
   */
  static async getSubscriptions(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await query(
        `SELECT s.*, u.username as subscribed_username, u.profile_image_url as subscribed_profile_image
         FROM subscriptions s
         JOIN users u ON s.subscribed_to_id = u.id
         WHERE s.subscriber_id = $1
         ORDER BY s.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      
      const countResult = await query(
        'SELECT COUNT(*) as total FROM subscriptions WHERE subscriber_id = $1',
        [userId]
      );
      
      return {
        subscriptions: result.rows.map(row => new Subscription(row)),
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      };
    } catch (error) {
      logger.error(`Error getting subscriptions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get subscription count for a user
   * @param {number} userId - User ID
   * @returns {number} Number of subscribers
   */
  static async getSubscriberCount(userId) {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE subscribed_to_id = $1',
        [userId]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Error getting subscriber count for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Convert subscription object to JSON
   * @returns {Object} Subscription data
   */
  toJSON() {
    return {
      id: this.id,
      subscriber_id: this.subscriber_id,
      subscribed_to_id: this.subscribed_to_id,
      created_at: this.created_at,
    };
  }
}