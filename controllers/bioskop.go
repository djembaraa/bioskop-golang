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

func GetBioskops(c *gin.Context) {
	var bioskops []models.Bioskop

	if err := config.DB.Find(&bioskops).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bioskops"})
		return
	}

	c.JSON(http.StatusOK, bioskops)
}

func GetBioskop(c *gin.Context) {
	id := c.Param("id")
	var bioskop models.Bioskop

	if err := config.DB.First(&bioskop, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bioskop not found"})
		return
	}

	c.JSON(http.StatusOK, bioskop)
}

func UpdateBioskop(c *gin.Context) {
	id := c.Param("id")
	var bioskop models.Bioskop

	if err := config.DB.First(&bioskop, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bioskop not found"})
		return
	}

	if err := c.ShouldBindJSON(&bioskop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&bioskop).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bioskop"})
		return
	}

	c.JSON(http.StatusOK, bioskop)
}

func DeleteBioskop(c *gin.Context) {
	id := c.Param("id")
	
	if err := config.DB.Delete(&models.Bioskop{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete bioskop"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bioskop deleted successfully"})
}