import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import BookingStatus from './pages/BookingStatus'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/booking/:showtimeId" element={<Booking />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/booking-status/:bookingCode" element={<BookingStatus />} />
        </Routes>
      </main>
    </div>
  )
}

export default App