package models

import "time"

type Booking struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ShowtimeID uint      `json:"showtime_id" binding:"required"`
	Showtime   Showtime  `gorm:"foreignKey:ShowtimeID" json:"showtime"`
	CustomerName string  `json:"customer_name" binding:"required"`
	CustomerEmail string `json:"customer_email" binding:"required"`
	CustomerPhone string `json:"customer_phone" binding:"required"`
	TotalPrice    float64 `json:"total_price"`
	Status        string  `json:"status"` // pending, confirmed, cancelled
	BookingCode   string  `json:"booking_code" gorm:"unique"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type BookingSeat struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	BookingID uint    `json:"booking_id"`
	Booking   Booking `gorm:"foreignKey:BookingID" json:"booking"`
	SeatID    uint    `json:"seat_id"`
	Seat      Seat    `gorm:"foreignKey:SeatID" json:"seat"`
}