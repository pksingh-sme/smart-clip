import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';

export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role || 'user';
    this.profile_image_url = data.profile_image_url;
    this.bio = data.bio;
    this.is_verified = data.is_verified || false;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {User} Created user
   */
  static async create(userData) {
    try {
      // Hash the password
      const hashedPassword = await hashPassword(userData.password);
      
      const result = await query(
        `INSERT INTO users 
        (username, email, password_hash, role, profile_image_url, bio, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || 'user',
          userData.profile_image_url || null,
          userData.bio || null,
          userData.is_verified || false,
          userData.is_active !== undefined ? userData.is_active : true
        ]
      );
      
      return new User(result.rows[0]);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {User|null} User or null if not found
   */
  static async findById(id) {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {User|null} User or null if not found
   */
  static async findByEmail(email) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {User|null} User or null if not found
   */
  static async findByUsername(username) {
    try {
      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error finding user by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {User} Updated user
   */
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic query based on provided fields
      for (const [key, value] of Object.entries(updateData)) {
        // Skip password field as it needs special handling
        if (key === 'password') continue;
        
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }

      // Handle password update separately
      if (updateData.password) {
        const hashedPassword = await hashPassword(updateData.password);
        fields.push(`password_hash = $${index}`);
        values.push(hashedPassword);
        index++;
      }

      // Add updated_at timestamp
      fields.push(`updated_at = NOW()`);
      
      // Add ID to values array
      values.push(id);

      const queryText = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = $${index} 
        RETURNING *`;

      const result = await query(queryText, values);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   * @param {number} id - User ID
   * @returns {boolean} True if successful
   */
  static async delete(id) {
    try {
      const result = await query(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {User|null} Authenticated user or null if invalid credentials
   */
  static async authenticate(email, password) {
    try {
      // Find user by email
      const user = await this.findByEmail(email);
      if (!user) return null;

      // Check if user is active
      if (!user.is_active) return null;

      // Compare passwords
      const isValid = await comparePassword(password, user.password_hash);
      return isValid ? user : null;
    } catch (error) {
      logger.error(`Error authenticating user ${email}:`, error);
      throw error;
    }
  }

  /**
   * Get user's videos
   * @param {number} userId - User ID
   * @returns {Array} Array of videos
   */
  static async getVideos(userId) {
    try {
      const result = await query(
        `SELECT v.*, u.username as creator_username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.user_id = $1 
         ORDER BY v.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error(`Error getting videos for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's subscribers count
   * @param {number} userId - User ID
   * @returns {number} Number of subscribers
   */
  static async getSubscribersCount(userId) {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE subscribed_to_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Error getting subscribers count for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to another user
   * @param {number} subscriberId - Subscriber user ID
   * @param {number} subscribedToId - User being subscribed to
   * @returns {boolean} True if subscribed
   */
  static async isSubscribed(subscriberId, subscribedToId) {
    try {
      const result = await query(
        'SELECT id FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2',
        [subscriberId, subscribedToId]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Error checking subscription status between ${subscriberId} and ${subscribedToId}:`, error);
      throw error;
    }
  }

  /**
   * Convert user object to JSON (excluding sensitive data)
   * @returns {Object} Public user data
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      profile_image_url: this.profile_image_url,
      bio: this.bio,
      is_verified: this.is_verified,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}