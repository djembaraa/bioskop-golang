import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all seats with optional bioskop filter
router.get('/', async (req, res) => {
  try {
    const { bioskop_id } = req.query;
    
    let query = 'SELECT * FROM seats';
    const params = [];
    
    if (bioskop_id) {
      query += ' WHERE bioskop_id = $1';
      params.push(bioskop_id);
    }
    
    query += ' ORDER BY "row", "column"';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// Get available seats for a showtime
router.get('/showtime/:showtime_id', async (req, res) => {
  try {
    const { showtime_id } = req.params;
    
    // First get the showtime to find the bioskop
    const showtimeResult = await pool.query(
      'SELECT bioskop_id FROM showtimes WHERE id = $1',
      [showtime_id]
    );
    
    if (showtimeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    
    const bioskop_id = showtimeResult.rows[0].bioskop_id;
    
    // Get all seats for this bioskop
    const seatsResult = await pool.query(
      'SELECT * FROM seats WHERE bioskop_id = $1 ORDER BY "row", "column"',
      [bioskop_id]
    );
    
    // Get booked seat IDs for this showtime
    const bookedSeatsResult = await pool.query(`
      SELECT bs.seat_id 
      FROM booking_seats bs
      JOIN bookings b ON bs.booking_id = b.id
      WHERE b.showtime_id = $1 AND b.status != 'cancelled'
    `, [showtime_id]);
    
    const bookedSeatIds = bookedSeatsResult.rows.map(row => row.seat_id);
    
    // Mark seats as available or not
    const seatsWithAvailability = seatsResult.rows.map(seat => ({
      ...seat,
      is_available: !bookedSeatIds.includes(seat.id)
    }));
    
    res.json(seatsWithAvailability);
  } catch (error) {
    console.error('Error fetching available seats:', error);
    res.status(500).json({ error: 'Failed to fetch available seats' });
  }
});

// Create multiple seats
router.post('/', async (req, res) => {
  try {
    const seats = req.body;
    
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Seats array is required' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const createdSeats = [];
      
      for (const seat of seats) {
        const { bioskop_id, seat_number, row, column, seat_type } = seat;
        
        if (!bioskop_id || !seat_number || !row || column === undefined) {
          throw new Error('Missing required seat fields');
        }
        
        const result = await client.query(
          'INSERT INTO seats (bioskop_id, seat_number, "row", "column", seat_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [bioskop_id, seat_number, row, column, seat_type || 'regular']
        );
        
        createdSeats.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json(createdSeats);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating seats:', error);
    res.status(500).json({ error: 'Failed to create seats' });
  }
});

export default router;