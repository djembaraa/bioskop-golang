package controllers

import (
	"bioskop-app/config"
	"bioskop-app/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateShowtime(c *gin.Context) {
	var showtime models.Showtime

	if err := c.ShouldBindJSON(&showtime); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&showtime).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create showtime"})
		return
	}

	// Load related data
	config.DB.Preload("Movie").Preload("Bioskop").First(&showtime, showtime.ID)

	c.JSON(http.StatusCreated, showtime)
}

func GetShowtimes(c *gin.Context) {
	var showtimes []models.Showtime
	
	// Get query parameters
	movieID := c.Query("movie_id")
	bioskopID := c.Query("bioskop_id")
	date := c.Query("date")

	query := config.DB.Preload("Movie").Preload("Bioskop")

	// Apply filters
	if movieID != "" {
		query = query.Where("movie_id = ?", movieID)
	}
	if bioskopID != "" {
		query = query.Where("bioskop_id = ?", bioskopID)
	}
	if date != "" {
		parsedDate, err := time.Parse("2006-01-02", date)
		if err == nil {
			query = query.Where("DATE(show_date) = ?", parsedDate.Format("2006-01-02"))
		}
	}

	if err := query.Find(&showtimes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch showtimes"})
		return
	}

	c.JSON(http.StatusOK, showtimes)
}

func GetShowtime(c *gin.Context) {
	id := c.Param("id")
	var showtime models.Showtime

	if err := config.DB.Preload("Movie").Preload("Bioskop").First(&showtime, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Showtime not found"})
		return
	}

	c.JSON(http.StatusOK, showtime)
}