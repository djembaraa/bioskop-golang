import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bioskopRoutes from './routes/bioskop.js';
import movieRoutes from './routes/movie.js';
import showtimeRoutes from './routes/showtime.js';
import seatRoutes from './routes/seat.js';
import bookingRoutes from './routes/booking.js';
import { initDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize database
await initDatabase();

// Routes
app.use('/api/bioskops', bioskopRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cinema Booking API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});