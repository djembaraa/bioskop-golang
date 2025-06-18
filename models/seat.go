package models

type Seat struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	BioskopID  uint   `json:"bioskop_id" binding:"required"`
	Bioskop    Bioskop `gorm:"foreignKey:BioskopID" json:"bioskop"`
	SeatNumber string `json:"seat_number" binding:"required"` // A1, A2, B1, etc.
	Row        string `json:"row" binding:"required"`         // A, B, C, etc.
	Column     int    `json:"column" binding:"required"`      // 1, 2, 3, etc.
	SeatType   string `json:"seat_type"`                      // regular, premium, vip
}