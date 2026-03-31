package initializers

import (
	"fmt"
	"log"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database"
	"github.com/jmoiron/sqlx"
)

/**
 * Migrate handles the database schema updates and initial data seeding.
 * It uses administrative privileges to ensure schema changes are permitted.
 */
func MigrateAndSeed() {
	adminDatabase, err := database.ConnectAdminToDB()
	if err != nil {
		log.Fatalf("[Migrate] Admin Connection Failed: %v", err)
	}
	defer adminDatabase.Close()

	database.RunAllMigrations(adminDatabase)
	fmt.Println("Database migration completed successfully.")

	privilegedTables := [...]string{
		"refresh_tokens",
		"sessions",
	}

	for _, tableName := range privilegedTables {
		err = grantDeleteOnTable(tableName, adminDatabase)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func grantDeleteOnTable(tableName string, db *sqlx.DB) error {
	databaseName := os.Getenv("MYSQL_DB_NAME")
	appUser := os.Getenv("APP_USER")

	query := fmt.Sprintf(
		"GRANT DELETE ON `%s`.`%s` TO '%s'@'%%'; FLUSH PRIVILEGES;",
		databaseName,
		tableName,
		appUser,
	)

	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("[GrantDeleteOnTable] {Query}: %v", err)
	}
	return nil
}
