import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cinema_booking',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Initialize database tables
export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bioskops (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        rating DECIMAL(2,1) DEFAULT 4.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        genre VARCHAR(100),
        rating VARCHAR(10),
        poster_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS showtimes (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        bioskop_id INTEGER REFERENCES bioskops(id) ON DELETE CASCADE,
        show_date DATE NOT NULL,
        show_time TIME NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        bioskop_id INTEGER REFERENCES bioskops(id) ON DELETE CASCADE,
        seat_number VARCHAR(10) NOT NULL,
        "row" VARCHAR(5) NOT NULL,
        "column" INTEGER NOT NULL,
        seat_type VARCHAR(20) DEFAULT 'regular'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        showtime_id INTEGER REFERENCES showtimes(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        booking_code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_seats (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        seat_id INTEGER REFERENCES seats(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default pool;