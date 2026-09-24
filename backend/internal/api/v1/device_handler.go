package v1

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/gin-gonic/gin"
)

// DeviceHandler handles proxying trusted device management to the IDP.
type DeviceHandler struct{}

// NewDeviceHandler creates a new instance of DeviceHandler.
func NewDeviceHandler() *DeviceHandler {
	return &DeviceHandler{}
}

// ListDevices proxies the GET request to retrieve user devices.
func (h *DeviceHandler) ListDevices(c *gin.Context) {
	idpURL := os.Getenv("IDP_DEVICES_URL")
	if idpURL == "" {
		idpURL = "http://localhost:8080/api/v1/devices"
	}

	proxyReq, err := http.NewRequest(http.MethodGet, idpURL, nil)
	if err != nil {
		log.Printf("[ListDevices] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build list devices request",
		})
		return
	}

	h.proxyToIDP(c, proxyReq)
}

// UpdateDevice proxies the PATCH request to rename a trusted device.
func (h *DeviceHandler) UpdateDevice(c *gin.Context) {
	idpBase := os.Getenv("IDP_DEVICES_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/devices"
	}
	idpURL := fmt.Sprintf("%s/%s", idpBase, c.Param("id"))

	proxyReq, err := http.NewRequest(
		http.MethodPatch,
		idpURL,
		c.Request.Body,
	)
	if err != nil {
		log.Printf("[UpdateDevice] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build update device request",
		})
		return
	}

	h.proxyToIDP(c, proxyReq)
}

// DeleteDevice proxies the DELETE request to remove/revoke a device.
func (h *DeviceHandler) DeleteDevice(c *gin.Context) {
	idpBase := os.Getenv("IDP_DEVICES_URL")
	if idpBase == "" {
		idpBase = "http://localhost:8080/api/v1/devices"
	}
	idpURL := fmt.Sprintf("%s/%s", idpBase, c.Param("id"))

	proxyReq, err := http.NewRequest(http.MethodDelete, idpURL, nil)
	if err != nil {
		log.Printf("[DeleteDevice] Build Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to build delete device request",
		})
		return
	}

	h.proxyToIDP(c, proxyReq)
}

func (h *DeviceHandler) proxyToIDP(c *gin.Context, proxyReq *http.Request) {
	proxyReq.Header.Set("X-API-Key", os.Getenv("BACKEND_API_KEY"))
	if token := getAccessToken(c); token != "" {
		proxyReq.Header.Set("Authorization", "Bearer "+token)
	}

	contentType := c.Request.Header.Get("Content-Type")
	if contentType != "" {
		proxyReq.Header.Set("Content-Type", contentType)
	}

	resp, err := Client.Do(proxyReq)
	if err != nil {
		log.Printf("[proxyToIDP] IDP Request: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch response from IDP",
		})
		return
	}
	defer resp.Body.Close()

	c.Header("Content-Type", resp.Header.Get("Content-Type"))
	c.Status(resp.StatusCode)
	_, _ = io.Copy(c.Writer, resp.Body)
}
