package controllers

import (
	"bioskop-app/config"
	"bioskop-app/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateSeats(c *gin.Context) {
	var seats []models.Seat

	if err := c.ShouldBindJSON(&seats); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create seats"})
		return
	}

	c.JSON(http.StatusCreated, seats)
}

func GetSeats(c *gin.Context) {
	bioskopID := c.Query("bioskop_id")
	var seats []models.Seat

	query := config.DB.Order("row, column")
	if bioskopID != "" {
		query = query.Where("bioskop_id = ?", bioskopID)
	}

	if err := query.Find(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch seats"})
		return
	}

	c.JSON(http.StatusOK, seats)
}

func GetAvailableSeats(c *gin.Context) {
	showtimeID := c.Param("showtime_id")
	
	// Get all seats for the bioskop
	var showtime models.Showtime
	if err := config.DB.Preload("Bioskop").First(&showtime, showtimeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Showtime not found"})
		return
	}

	var seats []models.Seat
	if err := config.DB.Where("bioskop_id = ?", showtime.BioskopID).Order("row, column").Find(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch seats"})
		return
	}

	// Get booked seats for this showtime
	var bookedSeatIDs []uint
	config.DB.Table("booking_seats").
		Joins("JOIN bookings ON bookings.id = booking_seats.booking_id").
		Where("bookings.showtime_id = ? AND bookings.status != 'cancelled'", showtimeID).
		Pluck("booking_seats.seat_id", &bookedSeatIDs)

	// Mark seats as available or booked
	type SeatAvailability struct {
		models.Seat
		IsAvailable bool `json:"is_available"`
	}

	var seatAvailability []SeatAvailability
	for _, seat := range seats {
		isAvailable := true
		for _, bookedID := range bookedSeatIDs {
			if seat.ID == bookedID {
				isAvailable = false
				break
			}
		}
		seatAvailability = append(seatAvailability, SeatAvailability{
			Seat:        seat,
			IsAvailable: isAvailable,
		})
	}

	c.JSON(http.StatusOK, seatAvailability)
}