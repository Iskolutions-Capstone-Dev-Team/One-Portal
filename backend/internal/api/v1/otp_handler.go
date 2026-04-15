package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

type OTPHandler struct{}

func NewOTPHandler() *OTPHandler {
	return &OTPHandler{}
}

// SendOTP proxies the OTP generation request to the Identity Provider.
// @Summary Send OTP Code
// @Description Generates a 6-digit numeric OTP and sends it via email through IDP.
// @Tags otp
// @Accept json
// @Produce json
// @Param request body dto.OTPRequest true "OTP Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /otp/send [post]
func (h *OTPHandler) SendOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	idpURL := fmt.Sprintf("%s/send", os.Getenv("IDP_OTP_URL"))
	body, _ := json.Marshal(req)
	
	proxyReq, _ := http.NewRequest(
		http.MethodPost, 
		idpURL, 
		bytes.NewBuffer(body),
	)
	proxyReq.Header.Set("Content-Type", "application/json")
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to send OTP via IDP",
		})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "OTP sent successfully"})
}

// VerifyOTP proxies the OTP verification request to the Identity Provider.
// @Summary Verify OTP Code
// @Description Verifies a 6-digit numeric OTP for a user through IDP.
// @Tags otp
// @Accept json
// @Produce json
// @Param request body dto.VerifyOTPRequest true "Verify OTP Request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /otp/verify [post]
func (h *OTPHandler) VerifyOTP(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	idpURL := fmt.Sprintf("%s/verify", os.Getenv("IDP_OTP_URL"))
	body, _ := json.Marshal(req)

	proxyReq, _ := http.NewRequest(
		http.MethodPost, 
		idpURL, 
		bytes.NewBuffer(body),
	)
	proxyReq.Header.Set("Content-Type", "application/json")
	proxyReq.Header.Set("X-API-Key", os.Getenv("VITE_BACKEND_API_KEY"))

	resp, err := Client.Do(proxyReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "OTP verification failed in IDP",
		})
		return
	}
	defer resp.Body.Close()

	c.JSON(
		http.StatusOK, 
		dto.SuccessResponse{Message: "OTP verified successfully"},
	)
}
