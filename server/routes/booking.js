import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Generate booking code
const generateBookingCode = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BK${timestamp}${random}`;
};

// Create new booking
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { showtime_id, customer_name, customer_email, customer_phone, seat_ids } = req.body;
    
    if (!showtime_id || !customer_name || !customer_email || !customer_phone || !seat_ids || seat_ids.length === 0) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Get showtime with price
    const showtimeResult = await client.query('SELECT price FROM showtimes WHERE id = $1', [showtime_id]);
    
    if (showtimeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Showtime not found' });
    }
    
    const price = parseFloat(showtimeResult.rows[0].price);
    
    // Check if seats are available
    const bookedSeatsResult = await client.query(`
      SELECT bs.seat_id 
      FROM booking_seats bs
      JOIN bookings b ON bs.booking_id = b.id
      WHERE b.showtime_id = $1 AND b.status != 'cancelled' AND bs.seat_id = ANY($2)
    `, [showtime_id, seat_ids]);
    
    if (bookedSeatsResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Some seats are already booked' });
    }
    
    // Generate booking code
    const booking_code = generateBookingCode();
    const total_price = price * seat_ids.length;
    
    // Create booking
    const bookingResult = await client.query(
      'INSERT INTO bookings (showtime_id, customer_name, customer_email, customer_phone, total_price, booking_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [showtime_id, customer_name, customer_email, customer_phone, total_price, booking_code]
    );
    
    const booking = bookingResult.rows[0];
    
    // Create booking seats
    for (const seat_id of seat_ids) {
      await client.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
        [booking.id, seat_id]
      );
    }
    
    await client.query('COMMIT');
    
    // Get complete booking data with showtime, movie, and bioskop info
    const completeBookingResult = await client.query(`
      SELECT b.*, 
             s.show_date, s.show_time, s.price,
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             bio.nama as bioskop_nama, bio.lokasi as bioskop_lokasi, bio.rating as bioskop_rating
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops bio ON s.bioskop_id = bio.id
      WHERE b.id = $1
    `, [booking.id]);
    
    const row = completeBookingResult.rows[0];
    const completeBooking = {
      id: row.id,
      showtime_id: row.showtime_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      total_price: parseFloat(row.total_price),
      status: row.status,
      booking_code: row.booking_code,
      created_at: row.created_at,
      updated_at: row.updated_at,
      showtime: {
        id: row.showtime_id,
        show_date: row.show_date,
        show_time: row.show_time,
        price: parseFloat(row.price),
        movie: {
          title: row.movie_title,
          description: row.movie_description,
          duration: row.movie_duration,
          genre: row.movie_genre,
          rating: row.movie_rating,
          poster_url: row.movie_poster_url
        },
        bioskop: {
          nama: row.bioskop_nama,
          lokasi: row.bioskop_lokasi,
          rating: parseFloat(row.bioskop_rating)
        }
      }
    };
    
    res.status(201).json(completeBooking);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             s.show_date, s.show_time, s.price,
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             bio.nama as bioskop_nama, bio.lokasi as bioskop_lokasi, bio.rating as bioskop_rating
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops bio ON s.bioskop_id = bio.id
      ORDER BY b.created_at DESC
    `);
    
    const bookings = result.rows.map(row => ({
      id: row.id,
      showtime_id: row.showtime_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      total_price: parseFloat(row.total_price),
      status: row.status,
      booking_code: row.booking_code,
      created_at: row.created_at,
      updated_at: row.updated_at,
      showtime: {
        id: row.showtime_id,
        show_date: row.show_date,
        show_time: row.show_time,
        price: parseFloat(row.price),
        movie: {
          title: row.movie_title,
          description: row.movie_description,
          duration: row.movie_duration,
          genre: row.movie_genre,
          rating: row.movie_rating,
          poster_url: row.movie_poster_url
        },
        bioskop: {
          nama: row.bioskop_nama,
          lokasi: row.bioskop_lokasi,
          rating: parseFloat(row.bioskop_rating)
        }
      }
    }));
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by booking code
router.get('/:booking_code', async (req, res) => {
  try {
    const { booking_code } = req.params;
    
    const bookingResult = await pool.query(`
      SELECT b.*, 
             s.show_date, s.show_time, s.price,
             m.title as movie_title, m.description as movie_description, m.duration as movie_duration, 
             m.genre as movie_genre, m.rating as movie_rating, m.poster_url as movie_poster_url,
             bio.nama as bioskop_nama, bio.lokasi as bioskop_lokasi, bio.rating as bioskop_rating
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN bioskops bio ON s.bioskop_id = bio.id
      WHERE b.booking_code = $1
    `, [booking_code]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Get booked seats
    const seatsResult = await pool.query(`
      SELECT bs.*, s.seat_number, s.row, s.column, s.seat_type
      FROM booking_seats bs
      JOIN seats s ON bs.seat_id = s.id
      WHERE bs.booking_id = $1
    `, [bookingResult.rows[0].id]);
    
    const row = bookingResult.rows[0];
    const booking = {
      id: row.id,
      showtime_id: row.showtime_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      total_price: parseFloat(row.total_price),
      status: row.status,
      booking_code: row.booking_code,
      created_at: row.created_at,
      updated_at: row.updated_at,
      showtime: {
        id: row.showtime_id,
        show_date: row.show_date,
        show_time: row.show_time,
        price: parseFloat(row.price),
        movie: {
          title: row.movie_title,
          description: row.movie_description,
          duration: row.movie_duration,
          genre: row.movie_genre,
          rating: row.movie_rating,
          poster_url: row.movie_poster_url
        },
        bioskop: {
          nama: row.bioskop_nama,
          lokasi: row.bioskop_lokasi,
          rating: parseFloat(row.bioskop_rating)
        }
      }
    };
    
    const seats = seatsResult.rows.map(seatRow => ({
      id: seatRow.id,
      booking_id: seatRow.booking_id,
      seat_id: seatRow.seat_id,
      seat: {
        id: seatRow.seat_id,
        seat_number: seatRow.seat_number,
        row: seatRow.row,
        column: seatRow.column,
        seat_type: seatRow.seat_type
      }
    }));
    
    res.json({ booking, seats });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Cancel booking
router.put('/:booking_code/cancel', async (req, res) => {
  try {
    const { booking_code } = req.params;
    
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_code = $2 RETURNING *',
      ['cancelled', booking_code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;