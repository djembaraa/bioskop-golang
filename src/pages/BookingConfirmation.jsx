import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Calendar, MapPin, Clock, Ticket, User, Mail, Phone } from 'lucide-react'

const BookingConfirmation = () => {
  const location = useLocation()
  const { booking, seats } = location.state || {}

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <Link to="/movies" className="btn-primary">Back to Movies</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your movie tickets have been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <div className="card p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Booking Code</p>
                <p className="text-lg font-bold text-primary-600">{booking.booking_code}</p>
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
                      {seat.seat_number}
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
        </div>

        {/* Important Information */}
        <div className="card p-6 mb-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3">Important Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please arrive at the cinema at least 15 minutes before showtime</li>
            <li>• Bring a valid ID for verification</li>
            <li>• Your booking code is required for ticket collection</li>
            <li>• Tickets are non-refundable and non-transferable</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/booking-status/${booking.booking_code}`}
            className="btn-outline text-center"
          >
            View Booking Status
          </Link>
          <Link
            to="/movies"
            className="btn-primary text-center"
          >
            Book Another Movie
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation