package models

import "time"

type Log struct {
	ID        int64     `db:"id" json:"id"`
	Actor     string    `db:"actor,omitempty" json:"actor,omitempty"`
	Action    string    `db:"action" json:"action"`
	Result    string    `db:"result" json:"result"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
