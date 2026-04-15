package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService service.UserService
}

// NewUserHandler creates a new instance of the UserHandler.
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// HandleUserInfo fetches user information from the IDP or database fallback.
// @Summary      Get user info
// @Description  Fetches the current user's profile from the IDP or database.
// @Tags         User
// @Produce      json
// @Success      200      {object}  dto.MeResponse
// @Failure      401      {object}  dto.ErrorResponse
// @Failure      404      {object}  dto.ErrorResponse
// @Failure      500      {object}  dto.ErrorResponse
// @Security     BearerAuth
// @Router       /userinfo [get]
func (h *UserHandler) HandleUserInfo(c *gin.Context) {
	// 1. Attempt to fetch from IDP
	accessToken, _ := c.Cookie(dto.AccessCookieName)
	if accessToken != "" {
		userInfoURL := os.Getenv("IDP_USERINFO_URL")
		req, _ := http.NewRequest("GET", userInfoURL, nil)
		req.Header.Set("Authorization", "Bearer "+accessToken)

		resp, err := Client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				var me dto.MeResponse
				if err := json.NewDecoder(resp.Body).Decode(&me); err == nil {
					c.JSON(http.StatusOK, me)
					return
				}
			}
		}
	}

	// 2. Fallback to local database if IDP call fails
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Unauthorized",
		})
		return
	}

	mapClaims := claims.(jwt.MapClaims)
	sub, _ := mapClaims["userId"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Could not parse identity",
		})
		return
	}

	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "User record not found",
		})
		return
	}

	// Map models.User to dto.MeResponse to ensure consistent structure
	response := dto.MeResponse{
		ID:         user.ID,
		FirstName:  user.FirstName,
		MiddleName: user.MiddleName,
		LastName:   user.LastName,
		NameSuffix: user.NameSuffix,
		Email:      user.Email,
	}

	c.JSON(http.StatusOK, response)
}

// PatchUserName updates the user's name via IDP proxy and local DB sync.
// @Summary      Update user name
// @Description  Proxies name update to IDP and synchronizes with local database.
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        id    path      string                 true  "User ID"
// @Param        name  body      dto.UpdateUserNameRequest true  "Name Data"
// @Success      200   {object}  dto.SuccessResponse
// @Failure      400   {object}  dto.ErrorResponse
// @Failure      500   {object}  dto.ErrorResponse
// @Security     BearerAuth
// @Router       /user/{id}/name [patch]
func (h *UserHandler) PatchUserName(c *gin.Context) {
	id := c.Param("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(
			http.StatusBadRequest, 
			dto.ErrorResponse{Error: "Invalid ID"},
		)
		return
	}

	var req dto.UpdateUserNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(
			http.StatusBadRequest, 
			dto.ErrorResponse{Error: "Invalid request"},
		)
		return
	}

	// 1. Proxy to IDP
	token, _ := c.Cookie(dto.AccessCookieName)
	idpURL := fmt.Sprintf("%s/%s/name", os.Getenv("IDP_USER_URL"), id)
	body, _ := json.Marshal(req)
	proxyReq, _ := http.NewRequest(
		http.MethodPatch, 
		idpURL, 
		bytes.NewBuffer(body),
	)
	proxyReq.Header.Set("Content-Type", "application/json")
	if token != "" {
		proxyReq.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := Client.Do(proxyReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		log.Printf("[PatchUserName] IDP Error: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to update user in IDP",
		})
		return
	}
	defer resp.Body.Close()

	// 2. Sync to local DB
	if err := h.userService.UpdateUserName(c.Request.Context(), userID, req); err != nil {
		log.Printf("[PatchUserName] DB Sync Error: %v", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to sync user update locally",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "User updated successfully"})
}

// PatchUserPasswordByEmail proxies password recovery to IDP.
// @Summary      Forgot password
// @Description  Proxies password reset request by email to the Identity Provider.
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body      dto.UpdatePasswordByEmailRequest true "Email Data"
// @Success      200     {object}  dto.SuccessResponse
// @Failure      400     {object}  dto.ErrorResponse
// @Failure      500     {object}  dto.ErrorResponse
// @Router       /user/password/forgot [patch]
func (h *UserHandler) PatchUserPasswordByEmail(c *gin.Context) {
	var req dto.UpdatePasswordByEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid request"})
		return
	}

	idpURL := fmt.Sprintf("%s/password/forgot", os.Getenv("IDP_USER_URL"))
	body, _ := json.Marshal(req)
	proxyReq, _ := http.NewRequest(http.MethodPatch, idpURL, bytes.NewBuffer(body))
	proxyReq.Header.Set("Content-Type", "application/json")

	resp, err := Client.Do(proxyReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to process password recovery in IDP",
		})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Password reset processed"})
}

// PatchChangePassword proxies authenticated password change to IDP.
// @Summary      Change password
// @Description  Proxies current user's password change request to the Identity Provider.
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body      dto.ChangePasswordRequest true "Password Data"
// @Success      200     {object}  dto.SuccessResponse
// @Failure      400     {object}  dto.ErrorResponse
// @Failure      401     {object}  dto.ErrorResponse
// @Failure      500     {object}  dto.ErrorResponse
// @Security     BearerAuth
// @Router       /user/password/change [patch]
func (h *UserHandler) PatchChangePassword(c *gin.Context) {
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid request"})
		return
	}

	idpURL := fmt.Sprintf("%s/password/change", os.Getenv("IDP_USER_URL"))
	body, _ := json.Marshal(req)
	proxyReq, _ := http.NewRequest(http.MethodPatch, idpURL, bytes.NewBuffer(body))
	proxyReq.Header.Set("Content-Type", "application/json")

	token, _ := c.Cookie(dto.AccessCookieName)
	if token != "" {
		proxyReq.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := Client.Do(proxyReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to change password in IDP",
		})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Password changed successfully"})
}
