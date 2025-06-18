package main

import (
	"bioskop-app/config"
	"bioskop-app/controllers"
	"bioskop-app/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Koneksi DB
	config.ConnectDatabase()
	
	// Auto migrate all models
	config.DB.AutoMigrate(
		&models.Bioskop{},
		&models.Movie{},
		&models.Showtime{},
		&models.Seat{},
		&models.Booking{},
		&models.BookingSeat{},
	)

	// Setup Router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Bioskop routes
		api.POST("/bioskops", controllers.CreateBioskop)
		api.GET("/bioskops", controllers.GetBioskops)
		api.GET("/bioskops/:id", controllers.GetBioskop)
		api.PUT("/bioskops/:id", controllers.UpdateBioskop)
		api.DELETE("/bioskops/:id", controllers.DeleteBioskop)

		// Movie routes
		api.POST("/movies", controllers.CreateMovie)
		api.GET("/movies", controllers.GetMovies)
		api.GET("/movies/:id", controllers.GetMovie)
		api.PUT("/movies/:id", controllers.UpdateMovie)
		api.DELETE("/movies/:id", controllers.DeleteMovie)

		// Showtime routes
		api.POST("/showtimes", controllers.CreateShowtime)
		api.GET("/showtimes", controllers.GetShowtimes)
		api.GET("/showtimes/:id", controllers.GetShowtime)

		// Seat routes
		api.POST("/seats", controllers.CreateSeats)
		api.GET("/seats", controllers.GetSeats)
		api.GET("/showtimes/:showtime_id/seats", controllers.GetAvailableSeats)

		// Booking routes
		api.POST("/bookings", controllers.CreateBooking)
		api.GET("/bookings", controllers.GetBookings)
		api.GET("/bookings/:booking_code", controllers.GetBooking)
		api.PUT("/bookings/:booking_code/cancel", controllers.CancelBooking)
	}

	// Jalankan server
	router.Run(":8080")
}