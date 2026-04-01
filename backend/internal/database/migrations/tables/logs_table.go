package tables

import "github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database/migrations"

var LogsMigration = migrations.TableMigration{
	TableName: "logs",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-logs-table",
			SQL: `
			 CREATE TABLE IF NOT EXISTS logs (
				id BIGINT AUTO_INCREMENT PRIMARY KEY,
				actor VARCHAR(100),
				action VARCHAR(100) NOT NULL,
				result ENUM('success', 'failure') NOT NULL,
				created_at TIMESTAMP DEFAULT NOW(),
				INDEX idx_actor (actor),
				INDEX idx_created_at (created_at)
			);`,
		},
	},
}
