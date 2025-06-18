import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Star, Calendar, MapPin } from 'lucide-react'
import api from '../services/api'

const MovieDetail = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [bioskops, setBioskops] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBioskop, setSelectedBioskop] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showtimesRes, bioskopsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/showtimes?movie_id=${id}`),
          api.get('/bioskops')
        ])
        
        setMovie(movieRes.data)
        setShowtimes(showtimesRes.data)
        setBioskops(bioskopsRes.data)
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const filteredShowtimes = showtimes.filter(showtime => {
    const showtimeDate = new Date(showtime.show_date).toISOString().split('T')[0]
    const matchesDate = !selectedDate || showtimeDate === selectedDate
    const matchesBioskop = !selectedBioskop || showtime.bioskop_id.toString() === selectedBioskop
    return matchesDate && matchesBioskop
  })

  const getAvailableDates = () => {
    const dates = [...new Set(showtimes.map(showtime => 
      new Date(showtime.show_date).toISOString().split('T')[0]
    ))].sort()
    return dates
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Movie not found</h2>
          <Link to="/movies" className="btn-primary">Back to Movies</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Movie Details */}
        <div className="card overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600'}
                alt={movie.title}
                className="w-full h-96 md:h-full object-cover"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{movie.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{movie.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold">{movie.rating}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Genre</p>
                  <p className="font-semibold">{movie.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Now Showing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showtimes */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Showtime</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              >
                <option value="">All Dates</option>
                {getAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Select Cinema
              </label>
              <select
                value={selectedBioskop}
                onChange={(e) => setSelectedBioskop(e.target.value)}
                className="input-field"
              >
                <option value="">All Cinemas</option>
                {bioskops.map(bioskop => (
                  <option key={bioskop.id} value={bioskop.id}>
                    {bioskop.nama} - {bioskop.lokasi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Showtime List */}
          {filteredShowtimes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No showtimes available for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShowtimes.map((showtime) => (
                <div key={showtime.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{showtime.bioskop.nama}</h3>
                      <p className="text-sm text-gray-600 mb-2">{showtime.bioskop.lokasi}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          {new Date(showtime.show_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="font-medium text-primary-600">{showtime.show_time}</span>
                        <span className="font-semibold text-green-600">
                          Rp {showtime.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/booking/${showtime.id}`}
                      className="btn-primary"
                    >
                      Select Seats
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetail