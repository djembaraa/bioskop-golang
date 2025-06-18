import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, CreditCard } from 'lucide-react'
import api from '../services/api'

const Booking = () => {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showtimeRes, seatsRes] = await Promise.all([
          api.get(`/showtimes/${showtimeId}`),
          api.get(`/showtimes/${showtimeId}/seats`)
        ])
        
        setShowtime(showtimeRes.data)
        setSeats(seatsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showtimeId])

  const handleSeatClick = (seat) => {
    if (!seat.is_available) return

    const isSelected = selectedSeats.find(s => s.id === seat.id)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all customer information')
      return
    }

    setBooking(true)

    try {
      const bookingData = {
        showtime_id: parseInt(showtimeId),
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        seat_ids: selectedSeats.map(seat => seat.id)
      }

      const response = await api.post('/bookings', bookingData)
      
      // Navigate to confirmation page with booking data
      navigate('/booking-confirmation', { 
        state: { 
          booking: response.data,
          seats: selectedSeats 
        } 
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const getSeatColor = (seat) => {
    if (!seat.is_available) return 'bg-red-500 cursor-not-allowed'
    if (selectedSeats.find(s => s.id === seat.id)) return 'bg-primary-600 text-white'
    return 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
  }

  const totalPrice = selectedSeats.length * (showtime?.price || 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Showtime not found</h2>
        </div>
      </div>
    )
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = []
    }
    acc[seat.row].push(seat)
    return acc
  }, {})

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Movie Info */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{showtime.movie.title}</h1>
              <p className="text-gray-600 mb-2">{showtime.bioskop.nama} - {showtime.bioskop.lokasi}</p>
              <p className="text-sm text-gray-500">
                {new Date(showtime.show_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {showtime.show_time}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-sm text-gray-500">Price per seat</p>
              <p className="text-2xl font-bold text-primary-600">
                Rp {showtime.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Your Seats</h2>
              
              {/* Screen */}
              <div className="mb-8">
                <div className="bg-gray-800 text-white text-center py-2 rounded-lg mb-4">
                  SCREEN
                </div>
              </div>

              {/* Seat Map */}
              <div className="space-y-4">
                {Object.keys(seatsByRow).sort().map(row => (
                  <div key={row} className="flex items-center justify-center space-x-2">
                    <span className="w-8 text-center font-medium text-gray-700">{row}</span>
                    <div className="flex space-x-2">
                      {seatsByRow[row].sort((a, b) => a.column - b.column).map(seat => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-8 rounded text-xs font-medium transition-colors duration-200 ${getSeatColor(seat)}`}
                          disabled={!seat.is_available}
                          title={`Seat ${seat.seat_number} - ${seat.is_available ? 'Available' : 'Occupied'}`}
                        >
                          {seat.column}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-8 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              {/* Selected Seats */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Selected Seats</h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-500 text-sm">No seats selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <span key={seat.id} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                        {seat.seat_number}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Seats ({selectedSeats.length})</span>
                    <span className="font-medium">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={selectedSeats.length === 0 || booking}
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  {booking ? 'Processing...' : 'Book Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking