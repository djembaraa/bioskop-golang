package models

type Bioskop struct {
	ID     uint    `gorm:"primaryKey" json:"id"`
	Nama   string  `json:"nama" binding:"required"`
	Lokasi string  `json:"lokasi" binding:"required"`
	Rating float32 `json:"rating"`
}
