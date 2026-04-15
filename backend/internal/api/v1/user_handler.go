package v1

import (
	"encoding/json"
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
