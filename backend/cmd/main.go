package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/database"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

const TimeOutDuration = 5 * time.Second

// @title One Portal API
// @version 1.0
// @description API for One Portal application.
// @contact.name API Support
// @contact.email support@oneportal.isaxbsit2027.com
func main() {
	// Load environment variables from .env file
	godotenv.Load()

	// Initialize the global JWK set for authentication
	initializers.InitJWKS()

	// Initialize S3 storage
	if err := initializers.InitS3Storage(); err != nil {
		log.Printf("[Main] S3 initialization failed (optional): %v", err)
	}

	// Run database migrations and seed initial data
	initializers.MigrateAndSeed()

	// Create a context that listens for interrupt signals
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	// Initialize the Gin router
	r := gin.Default()

	db, err := database.ConnectToDB()
	if err != nil {
		log.Fatalf("[Main] DB connection error: %v", err)
	}
	defer db.Close()

	repos := initializers.InitRepositories(db)
	defer repos.Log.Close()

	services := initializers.InitServices(repos)
	handlers := initializers.InitHandlers(services)
	routes := api.NewRoutes(handlers)
	routes.Register(r)

	server := &http.Server{
		Addr:    os.Getenv("BACKEND_PORT"),
		Handler: r,
	}

	go func() {
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Main] Server Listen Error: %v", err)
		}
	}()

	<-ctx.Done()

	stop()
	log.Println("Shutting down gracefully...")

	// Create a context with timeout for the shutdown process
	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		TimeOutDuration,
	)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("[Main] Forced Shutdown Error: %v", err)
	}

	log.Println("Server exited")
}
