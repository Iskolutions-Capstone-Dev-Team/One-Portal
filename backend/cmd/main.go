package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

const TimeOutDuration = 5 * time.Second

func main() {
	// Load environment variables from .env file
	godotenv.Load()

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
