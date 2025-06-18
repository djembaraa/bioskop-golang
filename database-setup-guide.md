# PostgreSQL Setup Guide for Cinema Booking System

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, remember the password you set for the `postgres` user
4. Default port is usually 5432

### Alternative - Using Docker (Recommended):
```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name cinema-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=cinema_booking -p 5432:5432 -d postgres:15
```

## Step 2: Create Database (if not using Docker)

Open PostgreSQL command line (psql) or pgAdmin:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE cinema_booking;

-- Exit
\q
```

## Step 3: Configure Environment Variables

Update the `.env` file with your actual database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinema_booking
DB_USER=postgres
DB_PASSWORD=your_actual_password
PORT=8080
```

## Step 4: Test Connection

You can test your PostgreSQL connection using:

```bash
# Test connection (replace with your password)
psql -h localhost -p 5432 -U postgres -d cinema_booking
```

## Common Issues:

### 1. Password Authentication Failed
- Make sure the password in `.env` matches your PostgreSQL password
- Try connecting manually with psql to verify credentials

### 2. Connection Refused
- Make sure PostgreSQL service is running
- Check if the port 5432 is correct
- Verify PostgreSQL is listening on localhost

### 3. Database Does Not Exist
- Create the database manually or let the application create it
- Make sure the database name matches what's in `.env`

## Quick Docker Setup (Easiest):

```bash
# Stop any existing container
docker stop cinema-postgres
docker rm cinema-postgres

# Run new container with correct settings
docker run --name cinema-postgres \
  -e POSTGRES_PASSWORD=cinema123 \
  -e POSTGRES_DB=cinema_booking \
  -p 5432:5432 \
  -d postgres:15

# Wait a few seconds for container to start
sleep 5

# Test connection
docker exec -it cinema-postgres psql -U postgres -d cinema_booking -c "SELECT version();"
```

Then update your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinema_booking
DB_USER=postgres
DB_PASSWORD=cinema123
PORT=8080
```