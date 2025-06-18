package models

import "time"

type Movie struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Duration    int       `json:"duration"` // in minutes
	Genre       string    `json:"genre"`
	Rating      string    `json:"rating"` // PG, PG-13, R, etc.
	PosterURL   string    `json:"poster_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}