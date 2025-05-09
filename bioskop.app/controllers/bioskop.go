package controllers

import (
	"bioskop-app/config"
	"bioskop-app/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateBioskop(c *gin.Context) {
	var bioskop models.Bioskop

	// Bind dan validasi input
	if err := c.ShouldBindJSON(&bioskop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama dan Lokasi tidak boleh kosong"})
		return
	}

	// Simpan ke DB
	if err := config.DB.Create(&bioskop).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan bioskop"})
		return
	}

	c.JSON(http.StatusCreated, bioskop)
}
