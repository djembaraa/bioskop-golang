import pool from './server/config/database.js';
import { additionalMovies, indonesianMovies } from './server/seeders/movies-data.js';

const addMoreMovies = async () => {
  try {
    console.log('🎬 Adding more movies to database...');
    
    const allMovies = [...additionalMovies, ...indonesianMovies];
    
    for (const movie of allMovies) {
      const result = await pool.query(
        'INSERT INTO movies (title, description, duration, genre, rating, poster_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [movie.title, movie.description, movie.duration, movie.genre, movie.rating, movie.poster_url]
      );
      console.log(`✅ Added: ${result.rows[0].title}`);
    }
    
    console.log(`🎉 Successfully added ${allMovies.length} more movies!`);
    
    // Add showtimes for new movies
    console.log('🕐 Adding showtimes for new movies...');
    
    const bioskopsResult = await pool.query('SELECT * FROM bioskops');
    const newMoviesResult = await pool.query('SELECT * FROM movies ORDER BY id DESC LIMIT $1', [allMovies.length]);
    
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
    
    for (const movie of newMoviesResult.rows) {
      for (const bioskop of bioskopsResult.rows) {
        for (const date of dates) {
          // Add 2-3 showtimes per day per movie per bioskop
          const numShowtimes = Math.floor(Math.random() * 2) + 2;
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
    
    console.log('✅ Showtimes added for new movies!');
    
  } catch (error) {
    console.error('❌ Error adding movies:', error);
  } finally {
    await pool.end();
  }
};

addMoreMovies();