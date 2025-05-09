package main

import (
	"bioskop-app/config"
	"bioskop-app/controllers"
	"bioskop-app/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// Koneksi DB
	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.Bioskop{})

	// Setup Router
	router := gin.Default()

	router.POST("/bioskop", controllers.CreateBioskop)

	// Jalankan server
	router.Run(":8080")
}
