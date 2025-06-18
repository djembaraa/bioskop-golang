import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Ticket, User, Mail, Phone, AlertCircle } from 'lucide-react'
import api from '../services/api'

const BookingStatus = () => {
  const { bookingCode } = useParams()
  const [bookingData, setBookingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingCode}`)
        setBookingData(response.data)
      } catch (error) {
        console.error('Error fetching booking:', error)
        setError('Booking not found')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingCode])

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await api.put(`/bookings/${bookingCode}/cancel`)
      // Refresh booking data
      const response = await api.get(`/bookings/${bookingCode}`)
      setBookingData(response.data)
      alert('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking code you entered could not be found.</p>
          <Link to="/movies" className="btn-primary">Back to Movies</Link>
        </div>
      </div>
    )
  }

  const { booking, seats } = bookingData

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Status</h1>
          <p className="text-lg text-gray-600">View your booking details and status</p>
        </div>

        {/* Booking Status Card */}
        <div className="card p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Booking Code</p>
                <p className="text-lg font-bold text-primary-600">{booking.booking_code}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Movie Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-primary-600" />
                Movie Information
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium">{booking.showtime.movie.title}</p>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(booking.showtime.show_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{booking.showtime.show_time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{booking.showtime.bioskop.nama} - {booking.showtime.bioskop.lokasi}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{booking.customer_name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{booking.customer_email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{booking.customer_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seats and Payment */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Selected Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {seats?.map(seat => (
                    <span key={seat.id} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {seat.seat.seat_number}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seats ({seats?.length || 0})</span>
                    <span>Rp {booking.total_price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">Rp {booking.total_price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Date */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-sm text-gray-500">
              Booked on: {new Date(booking.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancelBooking}
              className="btn-secondary text-red-600 hover:bg-red-50 border-red-300"
            >
              Cancel Booking
            </button>
          )}
          <Link
            to="/movies"
            className="btn-primary text-center"
          >
            Book Another Movie
          </Link>
        </div>

        {/* Status Information */}
        {booking.status === 'confirmed' && (
          <div className="card p-6 mt-6 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Your Booking is Confirmed!</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Please arrive at the cinema at least 15 minutes before showtime</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Show this booking code at the ticket counter</li>
            </ul>
          </div>
        )}

        {booking.status === 'cancelled' && (
          <div className="card p-6 mt-6 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800 mb-3">Booking Cancelled</h3>
            <p className="text-sm text-red-700">
              This booking has been cancelled. If you need assistance, please contact our customer service.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingStatus