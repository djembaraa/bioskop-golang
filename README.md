# Cinema Booking System (JavaScript)

A modern cinema ticket booking system built with Express.js backend and React frontend.

## 🚀 Features

- **Movie Management**: Browse and search movies
- **Cinema Locations**: Multiple cinema locations with seat management
- **Seat Selection**: Interactive seat selection with real-time availability
- **Booking System**: Complete booking flow with confirmation
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Node.js** - Runtime environment

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bioskop-javascript.git
   cd bioskop-javascript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL Database**
   - Create a database named `cinema_booking`
   - Update database credentials in `.env` file

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cinema_booking
   DB_USER=postgres
   DB_PASSWORD=password
   PORT=8080
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 📁 Project Structure

```
├── server/                 # Backend (Express.js)
│   ├── config/            # Database configuration
│   ├── routes/            # API routes
│   └── seeders/           # Database seeding
├── src/                   # Frontend (React)
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   └── services/         # API services
└── dist/                 # Build output
```

## 🎯 API Endpoints

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create new movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

### Bioskops (Cinemas)
- `GET /api/bioskops` - Get all cinemas
- `GET /api/bioskops/:id` - Get cinema by ID
- `POST /api/bioskops` - Create new cinema
- `PUT /api/bioskops/:id` - Update cinema
- `DELETE /api/bioskops/:id` - Delete cinema

### Showtimes
- `GET /api/showtimes` - Get all showtimes (with filters)
- `GET /api/showtimes/:id` - Get showtime by ID
- `POST /api/showtimes` - Create new showtime

### Seats
- `GET /api/seats` - Get all seats
- `GET /api/seats/showtime/:showtime_id` - Get available seats for showtime
- `POST /api/seats` - Create multiple seats

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:booking_code` - Get booking by code
- `PUT /api/bookings/:booking_code/cancel` - Cancel booking

## 🎬 Sample Data

The application comes with pre-seeded data including:
- 5 Cinema locations in Jakarta
- 8 Popular movies (Avatar, Top Gun, Black Panther, etc.)
- 96 seats per cinema (8 rows × 12 columns)
- Multiple showtimes across 3 days
- Sample bookings for demonstration

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Environment Setup
Make sure to set up your production environment variables and PostgreSQL database.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Movie poster images from Pexels
- Icons from Lucide React
- UI components styled with Tailwind CSS