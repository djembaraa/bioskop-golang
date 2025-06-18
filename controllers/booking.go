package controllers

import (
	"bioskop-app/config"
	"bioskop-app/models"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type BookingRequest struct {
	ShowtimeID    uint     `json:"showtime_id" binding:"required"`
	CustomerName  string   `json:"customer_name" binding:"required"`
	CustomerEmail string   `json:"customer_email" binding:"required"`
	CustomerPhone string   `json:"customer_phone" binding:"required"`
	SeatIDs       []uint   `json:"seat_ids" binding:"required"`
}

func CreateBooking(c *gin.Context) {
	var req BookingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start transaction
	tx := config.DB.Begin()

	// Get showtime with price
	var showtime models.Showtime
	if err := tx.First(&showtime, req.ShowtimeID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Showtime not found"})
		return
	}

	// Check if seats are available
	var bookedSeats []models.BookingSeat
	tx.Table("booking_seats").
		Joins("JOIN bookings ON bookings.id = booking_seats.booking_id").
		Where("bookings.showtime_id = ? AND bookings.status != 'cancelled' AND booking_seats.seat_id IN ?", 
			req.ShowtimeID, req.SeatIDs).
		Find(&bookedSeats)

	if len(bookedSeats) > 0 {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "Some seats are already booked"})
		return
	}

	// Generate booking code
	bookingCode := generateBookingCode()

	// Calculate total price
	totalPrice := showtime.Price * float64(len(req.SeatIDs))

	// Create booking
	booking := models.Booking{
		ShowtimeID:    req.ShowtimeID,
		CustomerName:  req.CustomerName,
		CustomerEmail: req.CustomerEmail,
		CustomerPhone: req.CustomerPhone,
		TotalPrice:    totalPrice,
		Status:        "confirmed",
		BookingCode:   bookingCode,
	}

	if err := tx.Create(&booking).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	// Create booking seats
	for _, seatID := range req.SeatIDs {
		bookingSeat := models.BookingSeat{
			BookingID: booking.ID,
			SeatID:    seatID,
		}
		if err := tx.Create(&bookingSeat).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book seats"})
			return
		}
	}

	// Commit transaction
	tx.Commit()

	// Load complete booking data
	config.DB.Preload("Showtime.Movie").Preload("Showtime.Bioskop").First(&booking, booking.ID)

	c.JSON(http.StatusCreated, booking)
}

func GetBooking(c *gin.Context) {
	bookingCode := c.Param("booking_code")
	var booking models.Booking

	if err := config.DB.Preload("Showtime.Movie").Preload("Showtime.Bioskop").
		Where("booking_code = ?", bookingCode).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Get booked seats
	var bookingSeats []models.BookingSeat
	config.DB.Preload("Seat").Where("booking_id = ?", booking.ID).Find(&bookingSeats)

	response := gin.H{
		"booking": booking,
		"seats":   bookingSeats,
	}

	c.JSON(http.StatusOK, response)
}

func GetBookings(c *gin.Context) {
	var bookings []models.Booking

	if err := config.DB.Preload("Showtime.Movie").Preload("Showtime.Bioskop").
		Order("created_at DESC").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

func CancelBooking(c *gin.Context) {
	bookingCode := c.Param("booking_code")
	var booking models.Booking

	if err := config.DB.Where("booking_code = ?", bookingCode).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	booking.Status = "cancelled"
	if err := config.DB.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled successfully"})
}

func generateBookingCode() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("BK%d%04d", time.Now().Unix()%10000, rand.Intn(10000))
}