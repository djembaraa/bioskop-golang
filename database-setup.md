# PostgreSQL Database Setup Guide

## 1. Install PostgreSQL

### Windows:
- Download from https://www.postgresql.org/download/windows/
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user

### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Create Database

Open PostgreSQL command line (psql) or use pgAdmin:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE cinema_booking;

-- Create user (optional)
CREATE USER cinema_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cinema_booking TO cinema_user;

-- Exit
\q
```

## 3. Configure Environment

Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinema_booking
DB_USER=postgres
DB_PASSWORD=your_actual_password
PORT=8080
```

## 4. Run the Application

The database tables will be created automatically when you start the server:

```bash
# Install dependencies
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

## 5. Database Schema

The application will create these tables:
- `bioskops` - Cinema locations
- `movies` - Movie information
- `showtimes` - Movie schedules
- `seats` - Cinema seats
- `bookings` - Customer bookings
- `booking_seats` - Seat reservations

## 6. Sample Data Included

The seeder will populate your database with:
- 5 Cinema locations in Jakarta
- 8 Popular movies (Avatar, Top Gun, Black Panther, etc.)
- 96 seats per cinema (8 rows × 12 columns)
- Multiple showtimes across 3 days
- Sample bookings for demonstration