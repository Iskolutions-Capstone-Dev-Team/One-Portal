package initializers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/middleware"
)

/**
 * InitJWKS fetches the JSON Web Key Set from the identity provider
 * and stores it in the middleware package for global access.
 */
func InitJWKS() {
	jwksURL := os.Getenv("ID_JWKS_URL")
	if jwksURL == "" {
		// Fallback to IDP_JWKS_URL if ID_JWKS_URL is not set
		jwksURL = os.Getenv("IDP_JWKS_URL")
	}

	if jwksURL == "" {
		log.Fatal("[InitJWKS] IDP_JWKS_URL not set")
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(jwksURL)
	if err != nil {
		log.Fatalf("[InitJWKS] Failed to fetch JWKS: %v", err)
	}
	defer resp.Body.Close()

	var jwks struct {
		Keys []dto.JWK `json:"keys"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		log.Fatalf("[InitJWKS] Failed to decode JWKS: %v", err)
	}

	middleware.GlobalJWKS = jwks.Keys
	log.Println("[InitJWKS] Global JWKS initialized")
}
