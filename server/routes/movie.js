import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Create new movie
router.post('/', async (req, res) => {
  try {
    const { title, description, duration, genre, rating, poster_url } = req.body;
    
    if (!title || !duration) {
      return res.status(400).json({ error: 'Title and duration are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO movies (title, description, duration, genre, rating, poster_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, duration, genre, rating, poster_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// Update movie
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, genre, rating, poster_url } = req.body;
    
    const result = await pool.query(
      'UPDATE movies SET title = $1, description = $2, duration = $3, genre = $4, rating = $5, poster_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, description, duration, genre, rating, poster_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete movie
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

export default router;