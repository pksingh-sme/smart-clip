import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'streamhub_dev',
  user: process.env.DB_USER || 'streamhub_user',
  password: process.env.DB_PASSWORD || 'streamhub_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    logger.error('Error connecting to PostgreSQL database:', err);
    process.exit(1);
  }
};

// Query helper function
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Error executing query', { text, error: error.message });
    throw error;
  }
};

export default pool;