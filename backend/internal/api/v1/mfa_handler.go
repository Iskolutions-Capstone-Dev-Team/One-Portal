package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

// MFAHandler manages requests related to Multi-Factor Authentication (MFA).
// It acts as a gateway, proxying requests directly to the Identity Provider.
type MFAHandler struct{}

// NewMFAHandler creates a new instance of MFAHandler.
func NewMFAHandler() *MFAHandler {
	return &MFAHandler{}
}

// GetTOTPSetup forwards requests to retrieve a new TOTP secret and URI.
// @Summary      Get TOTP Setup
// @Description  Requests new TOTP secret and URI configuration from IDP.
// @Tags         MFA
// @Produce      json
// @Param        email query string true "User Email"
// @Success      200 {object} dto.TOTPSetupResponse
// @Failure      400 {object} dto.ErrorResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /mfa/setup [get]
func (h *MFAHandler) GetTOTPSetup(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Email parameter is required",
		})
		return
	}

	idpBase := os.Getenv("IDP_MFA_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/mfa"
	}
	idpURL := fmt.Sprintf(
		"%s/setup?email=%s",
		idpBase,
		url.QueryEscape(email),
	)

	proxyReq, err := http.NewRequest(http.MethodGet, idpURL, nil)
	if err != nil {
		log.Printf("[GetTOTPSetup] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build MFA setup request",
		})
		return
	}
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[GetTOTPSetup] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch MFA setup from IDP",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp dto.ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil {
			c.JSON(resp.StatusCode, errResp)
		} else {
			c.JSON(resp.StatusCode, dto.ErrorResponse{
				Error: "MFA setup failed in IDP",
			})
		}
		return
	}

	var setupResp dto.TOTPSetupResponse
	if err := json.NewDecoder(resp.Body).Decode(&setupResp); err != nil {
		log.Printf("[GetTOTPSetup] Decode Response: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode setup response",
		})
		return
	}

	c.JSON(http.StatusOK, setupResp)
}

// PostAuthenticator verifies and saves a new TOTP authenticator in IDP.
// @Summary      Register Authenticator
// @Description  Verifies and saves a newly registered TOTP authenticator.
// @Tags         MFA
// @Accept       json
// @Produce      json
// @Param        request body dto.TOTPFinalizeRequest true "Finalize payload"
// @Success      200 {object} dto.MFASetupResponse
// @Failure      400 {object} dto.ErrorResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /mfa/authenticators [post]
func (h *MFAHandler) PostAuthenticator(c *gin.Context) {
	var req dto.TOTPFinalizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostAuthenticator] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	idpBase := os.Getenv("IDP_MFA_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/mfa"
	}
	idpURL := fmt.Sprintf("%s/authenticators", idpBase)

	body, _ := json.Marshal(req)
	proxyReq, err := http.NewRequest(
		http.MethodPost,
		idpURL,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Printf("[PostAuthenticator] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build authenticator request",
		})
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[PostAuthenticator] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to save authenticator in IDP",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp dto.ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil {
			c.JSON(resp.StatusCode, errResp)
		} else {
			c.JSON(resp.StatusCode, dto.ErrorResponse{
				Error: "Authenticator save failed in IDP",
			})
		}
		return
	}

	var saveResp dto.MFASetupResponse
	if err := json.NewDecoder(resp.Body).Decode(&saveResp); err != nil {
		log.Printf("[PostAuthenticator] Decode Response: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode save response",
		})
		return
	}

	c.JSON(http.StatusOK, saveResp)
}

// PostVerifyMFA verifies the 6-digit TOTP or backup code through the IDP.
// @Summary      Verify MFA Code
// @Description  Submits a 6-digit TOTP or backup code to the IDP for verification.
// @Tags         MFA
// @Accept       json
// @Produce      json
// @Param        request body dto.MFAVerifyRequest true "Verify payload"
// @Success      200 {object} dto.SuccessResponse
// @Failure      400 {object} dto.ErrorResponse
// @Failure      412 {object} dto.ErrorResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /mfa/verify [post]
func (h *MFAHandler) PostVerifyMFA(c *gin.Context) {
	var req dto.MFAVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[PostVerifyMFA] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	idpBase := os.Getenv("IDP_MFA_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/mfa"
	}
	idpURL := fmt.Sprintf("%s/verify", idpBase)

	body, _ := json.Marshal(req)
	proxyReq, err := http.NewRequest(
		http.MethodPost,
		idpURL,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Printf("[PostVerifyMFA] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build MFA verify request",
		})
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[PostVerifyMFA] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to verify MFA in IDP",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp dto.ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil {
			c.JSON(resp.StatusCode, errResp)
		} else {
			c.JSON(resp.StatusCode, dto.ErrorResponse{
				Error: "MFA verification failed in IDP",
			})
		}
		return
	}

	var verifyResp dto.SuccessResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		log.Printf("[PostVerifyMFA] Decode Response: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode verify response",
		})
		return
	}

	c.JSON(http.StatusOK, verifyResp)
}

// GetAuthenticatorList returns all registered authenticators for a user email.
// @Summary      Get Authenticators List
// @Description  Requests registered authenticators list from the IDP.
// @Tags         MFA
// @Produce      json
// @Param        email query string true "User Email"
// @Success      200 {array} dto.MFAAuthenticatorResponse
// @Failure      400 {object} dto.ErrorResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /mfa/authenticators/list [get]
func (h *MFAHandler) GetAuthenticatorList(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Email parameter is required",
		})
		return
	}

	idpBase := os.Getenv("IDP_MFA_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/mfa"
	}
	idpURL := fmt.Sprintf(
		"%s/authenticators/list?email=%s",
		idpBase,
		url.QueryEscape(email),
	)

	proxyReq, err := http.NewRequest(http.MethodGet, idpURL, nil)
	if err != nil {
		log.Printf("[GetAuthenticatorList] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build list request",
		})
		return
	}
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[GetAuthenticatorList] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch authenticators from IDP",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp dto.ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil {
			c.JSON(resp.StatusCode, errResp)
		} else {
			c.JSON(resp.StatusCode, dto.ErrorResponse{
				Error: "Fetch authenticators failed in IDP",
			})
		}
		return
	}

	var listResp []dto.MFAAuthenticatorResponse
	if err := json.NewDecoder(resp.Body).Decode(&listResp); err != nil {
		log.Printf("[GetAuthenticatorList] Decode Response: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode list response",
		})
		return
	}

	c.JSON(http.StatusOK, listResp)
}

// DeleteAuthenticator removes an MFA authenticator registration using the IDP.
// @Summary      Delete Authenticator
// @Description  Requests the removal of a registered authenticator from IDP.
// @Tags         MFA
// @Accept       json
// @Produce      json
// @Param        request body dto.MFADeleteRequest true "Delete payload"
// @Success      200 {object} dto.SuccessResponse
// @Failure      400 {object} dto.ErrorResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /mfa/authenticators [delete]
func (h *MFAHandler) DeleteAuthenticator(c *gin.Context) {
	var req dto.MFADeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[DeleteAuthenticator] Bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	idpBase := os.Getenv("IDP_MFA_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/mfa"
	}
	idpURL := fmt.Sprintf("%s/authenticators", idpBase)

	body, _ := json.Marshal(req)
	proxyReq, err := http.NewRequest(
		http.MethodDelete,
		idpURL,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Printf("[DeleteAuthenticator] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build delete request",
		})
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[DeleteAuthenticator] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to delete authenticator in IDP",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp dto.ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil {
			c.JSON(resp.StatusCode, errResp)
		} else {
			c.JSON(resp.StatusCode, dto.ErrorResponse{
				Error: "Authenticator deletion failed in IDP",
			})
		}
		return
	}

	var delResp dto.SuccessResponse
	if err := json.NewDecoder(resp.Body).Decode(&delResp); err != nil {
		log.Printf("[DeleteAuthenticator] Decode Response: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to decode delete response",
		})
		return
	}

	c.JSON(http.StatusOK, delResp)
}
