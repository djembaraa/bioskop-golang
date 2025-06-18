import pool from '../config/database.js';
import { initDatabase } from '../config/database.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database first
    await initDatabase();
    
    // Clear existing data
    await pool.query('TRUNCATE TABLE booking_seats, bookings, showtimes, seats, movies, bioskops RESTART IDENTITY CASCADE');
    
    // Seed Bioskops
    console.log('📍 Seeding bioskops...');
    const bioskops = [
      { nama: 'CGV Grand Indonesia', lokasi: 'Jakarta Pusat', rating: 4.5 },
      { nama: 'Cinema XXI Plaza Senayan', lokasi: 'Jakarta Selatan', rating: 4.3 },
      { nama: 'Cinepolis Lippo Mall Puri', lokasi: 'Jakarta Barat', rating: 4.4 },
      { nama: 'IMAX Kelapa Gading', lokasi: 'Jakarta Utara', rating: 4.7 },
      { nama: 'CGV Blitz Megaplex', lokasi: 'Jakarta Timur', rating: 4.2 }
    ];
    
    const bioskopResults = [];
    for (const bioskop of bioskops) {
      const result = await pool.query(
        'INSERT INTO bioskops (nama, lokasi, rating) VALUES ($1, $2, $3) RETURNING *',
        [bioskop.nama, bioskop.lokasi, bioskop.rating]
      );
      bioskopResults.push(result.rows[0]);
    }
    
    // Seed Movies
    console.log('🎬 Seeding movies...');
    const movies = [
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Navi race to protect their home.',
        duration: 192,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Top Gun: Maverick',
        description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUNs elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
        duration: 131,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Black Panther: Wakanda Forever',
        description: 'The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King TChalla.',
        duration: 161,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Spider-Man: No Way Home',
        description: 'With Spider-Mans identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
        duration: 148,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'The Batman',
        description: 'When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the citys hidden corruption and question his familys involvement.',
        duration: 176,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Dune',
        description: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
        duration: 155,
        genre: 'Sci-Fi',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'Encanto',
        description: 'A Colombian teenage girl has to face the frustration of being the only member of her family without magical powers.',
        duration: 102,
        genre: 'Animation',
        rating: 'PG',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        title: 'No Time to Die',
        description: 'James Bond has left active service. His peace is short-lived when Felix Leiter, an old friend from the CIA, turns up asking for help, leading Bond onto the trail of a mysterious villain armed with dangerous new technology.',
        duration: 163,
        genre: 'Action',
        rating: 'PG-13',
        poster_url: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ];
    
    const movieResults = [];
    for (const movie of movies) {
      const result = await pool.query(
        'INSERT INTO movies (title, description, duration, genre, rating, poster_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [movie.title, movie.description, movie.duration, movie.genre, movie.rating, movie.poster_url]
      );
      movieResults.push(result.rows[0]);
    }
    
    // Seed Seats for each bioskop
    console.log('💺 Seeding seats...');
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const columnsPerRow = 12;
    
    for (const bioskop of bioskopResults) {
      for (const row of rows) {
        for (let column = 1; column <= columnsPerRow; column++) {
          const seatNumber = `${row}${column}`;
          const seatType = (row === 'A' || row === 'B') ? 'premium' : 'regular';
          
          await pool.query(
            'INSERT INTO seats (bioskop_id, seat_number, row, column, seat_type) VALUES ($1, $2, $3, $4, $5)',
            [bioskop.id, seatNumber, row, column, seatType]
          );
        }
      }
    }
    
    // Seed Showtimes
    console.log('🕐 Seeding showtimes...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const dates = [
      today.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0],
      dayAfter.toISOString().split('T')[0]
    ];
    
    const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];
    const prices = [50000, 60000, 75000, 80000, 90000];
    
    for (const movie of movieResults) {
      for (const bioskop of bioskopResults) {
        for (const date of dates) {
          // Add 2-3 showtimes per day per movie per bioskop
          const numShowtimes = Math.floor(Math.random() * 2) + 2; // 2 or 3 showtimes
          const selectedTimes = times.slice(0, numShowtimes);
          
          for (const time of selectedTimes) {
            const price = prices[Math.floor(Math.random() * prices.length)];
            
            await pool.query(
              'INSERT INTO showtimes (movie_id, bioskop_id, show_date, show_time, price) VALUES ($1, $2, $3, $4, $5)',
              [movie.id, bioskop.id, date, time, price]
            );
          }
        }
      }
    }
    
    // Seed some sample bookings
    console.log('🎫 Seeding sample bookings...');
    const showtimesResult = await pool.query('SELECT * FROM showtimes LIMIT 5');
    const sampleCustomers = [
      { name: 'John Doe', email: 'john@example.com', phone: '081234567890' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '081234567891' },
      { name: 'Bob Johnson', email: 'bob@example.com', phone: '081234567892' }
    ];
    
    for (let i = 0; i < 3; i++) {
      const showtime = showtimesResult.rows[i];
      const customer = sampleCustomers[i];
      
      // Get some seats for this bioskop
      const seatsResult = await pool.query(
        'SELECT * FROM seats WHERE bioskop_id = $1 LIMIT 2',
        [showtime.bioskop_id]
      );
      
      if (seatsResult.rows.length > 0) {
        const bookingCode = `BK${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const totalPrice = showtime.price * seatsResult.rows.length;
        
        const bookingResult = await pool.query(
          'INSERT INTO bookings (showtime_id, customer_name, customer_email, customer_phone, total_price, booking_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [showtime.id, customer.name, customer.email, customer.phone, totalPrice, bookingCode]
        );
        
        // Add booking seats
        for (const seat of seatsResult.rows) {
          await pool.query(
            'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
            [bookingResult.rows[0].id, seat.id]
          );
        }
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded:`);
    console.log(`   - ${bioskops.length} bioskops`);
    console.log(`   - ${movies.length} movies`);
    console.log(`   - ${bioskopResults.length * rows.length * columnsPerRow} seats`);
    console.log(`   - Multiple showtimes for each movie and bioskop`);
    console.log(`   - 3 sample bookings`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().catch(console.error);
}

export default seedData;