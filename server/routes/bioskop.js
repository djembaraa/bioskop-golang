import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all bioskops
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bioskops ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bioskops:', error);
    res.status(500).json({ error: 'Failed to fetch bioskops' });
  }
});

// Get bioskop by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bioskops WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bioskop not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching bioskop:', error);
    res.status(500).json({ error: 'Failed to fetch bioskop' });
  }
});

// Create new bioskop
router.post('/', async (req, res) => {
  try {
    const { nama, lokasi, rating } = req.body;
    
    if (!nama || !lokasi) {
      return res.status(400).json({ error: 'Nama dan Lokasi tidak boleh kosong' });
    }
    
    const result = await pool.query(
      'INSERT INTO bioskops (nama, lokasi, rating) VALUES ($1, $2, $3) RETURNING *',
      [nama, lokasi, rating || 4.5]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bioskop:', error);
    res.status(500).json({ error: 'Failed to create bioskop' });
  }
});

// Update bioskop
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, lokasi, rating } = req.body;
    
    const result = await pool.query(
      'UPDATE bioskops SET nama = $1, lokasi = $2, rating = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [nama, lokasi, rating, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bioskop not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bioskop:', error);
    res.status(500).json({ error: 'Failed to update bioskop' });
  }
});

// Delete bioskop
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM bioskops WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bioskop not found' });
    }
    
    res.json({ message: 'Bioskop deleted successfully' });
  } catch (error) {
    console.error('Error deleting bioskop:', error);
    res.status(500).json({ error: 'Failed to delete bioskop' });
  }
});

export default router;