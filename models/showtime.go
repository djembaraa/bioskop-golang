package models

import "time"

type Showtime struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	MovieID   uint      `json:"movie_id" binding:"required"`
	Movie     Movie     `gorm:"foreignKey:MovieID" json:"movie"`
	BioskopID uint      `json:"bioskop_id" binding:"required"`
	Bioskop   Bioskop   `gorm:"foreignKey:BioskopID" json:"bioskop"`
	ShowDate  time.Time `json:"show_date" binding:"required"`
	ShowTime  string    `json:"show_time" binding:"required"` // Format: "14:30"
	Price     float64   `json:"price" binding:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}