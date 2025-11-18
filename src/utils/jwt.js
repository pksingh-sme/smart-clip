import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

/**
 * Generate JWT token
 * @param {Object} payload - Data to be included in the token
 * @param {string} expiresIn - Token expiration time (e.g., '1h', '7d')
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = '24h') => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    throw error;
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to be included in the token
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  try {
    // Refresh tokens typically have longer expiration times
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};