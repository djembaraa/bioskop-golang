import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all showtimes with filters
router.get('/', async (req, res) => {
  try {
    const { movie_id, bioskop_id, date } = req.query;
    
    let query = `
      SELECT s.*, 
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             b.nama as bioskop_nama, b.lokasi as bioskop_lokasi, b.rating as bioskop_rating
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops b ON s.bioskop_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (movie_id) {
      paramCount++;
      query += ` AND s.movie_id = $${paramCount}`;
      params.push(movie_id);
    }
    
    if (bioskop_id) {
      paramCount++;
      query += ` AND s.bioskop_id = $${paramCount}`;
      params.push(bioskop_id);
    }
    
    if (date) {
      paramCount++;
      query += ` AND s.show_date = $${paramCount}`;
      params.push(date);
    }
    
    query += ' ORDER BY s.show_date, s.show_time';
    
    const result = await pool.query(query, params);
    
    // Transform the result to match the expected structure
    const showtimes = result.rows.map(row => ({
      id: row.id,
      movie_id: row.movie_id,
      bioskop_id: row.bioskop_id,
      show_date: row.show_date,
      show_time: row.show_time,
      price: parseFloat(row.price),
      created_at: row.created_at,
      updated_at: row.updated_at,
      movie: {
        id: row.movie_id,
        title: row.movie_title,
        description: row.movie_description,
        duration: row.movie_duration,
        genre: row.movie_genre,
        rating: row.movie_rating,
        poster_url: row.movie_poster_url
      },
      bioskop: {
        id: row.bioskop_id,
        nama: row.bioskop_nama,
        lokasi: row.bioskop_lokasi,
        rating: parseFloat(row.bioskop_rating)
      }
    }));
    
    res.json(showtimes);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({ error: 'Failed to fetch showtimes' });
  }
});

// Get showtime by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, 
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             b.nama as bioskop_nama, b.lokasi as bioskop_lokasi, b.rating as bioskop_rating
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops b ON s.bioskop_id = b.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    
    const row = result.rows[0];
    const showtime = {
      id: row.id,
      movie_id: row.movie_id,
      bioskop_id: row.bioskop_id,
      show_date: row.show_date,
      show_time: row.show_time,
      price: parseFloat(row.price),
      created_at: row.created_at,
      updated_at: row.updated_at,
      movie: {
        id: row.movie_id,
        title: row.movie_title,
        description: row.movie_description,
        duration: row.movie_duration,
        genre: row.movie_genre,
        rating: row.movie_rating,
        poster_url: row.movie_poster_url
      },
      bioskop: {
        id: row.bioskop_id,
        nama: row.bioskop_nama,
        lokasi: row.bioskop_lokasi,
        rating: parseFloat(row.bioskop_rating)
      }
    };
    
    res.json(showtime);
  } catch (error) {
    console.error('Error fetching showtime:', error);
    res.status(500).json({ error: 'Failed to fetch showtime' });
  }
});

// Create new showtime
router.post('/', async (req, res) => {
  try {
    const { movie_id, bioskop_id, show_date, show_time, price } = req.body;
    
    if (!movie_id || !bioskop_id || !show_date || !show_time || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO showtimes (movie_id, bioskop_id, show_date, show_time, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [movie_id, bioskop_id, show_date, show_time, price]
    );
    
    // Get the complete showtime data with movie and bioskop info
    const showtimeResult = await pool.query(`
      SELECT s.*, 
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             b.nama as bioskop_nama, b.lokasi as bioskop_lokasi, b.rating as bioskop_rating
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops b ON s.bioskop_id = b.id
      WHERE s.id = $1
    `, [result.rows[0].id]);
    
    const row = showtimeResult.rows[0];
    const showtime = {
      id: row.id,
      movie_id: row.movie_id,
      bioskop_id: row.bioskop_id,
      show_date: row.show_date,
      show_time: row.show_time,
      price: parseFloat(row.price),
      created_at: row.created_at,
      updated_at: row.updated_at,
      movie: {
        id: row.movie_id,
        title: row.movie_title,
        description: row.movie_description,
        duration: row.movie_duration,
        genre: row.movie_genre,
        rating: row.movie_rating,
        poster_url: row.movie_poster_url
      },
      bioskop: {
        id: row.bioskop_id,
        nama: row.bioskop_nama,
        lokasi: row.bioskop_lokasi,
        rating: parseFloat(row.bioskop_rating)
      }
    };
    
    res.status(201).json(showtime);
  } catch (error) {
    console.error('Error creating showtime:', error);
    res.status(500).json({ error: 'Failed to create showtime' });
  }
});

export default router;