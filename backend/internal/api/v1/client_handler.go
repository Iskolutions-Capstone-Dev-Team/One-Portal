package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ClientHandler struct {
	service service.ClientService
}

func NewClientHandler(service service.ClientService) *ClientHandler {
	return &ClientHandler{service: service}
}

func (h *ClientHandler) CreateClient(c *gin.Context) {
	var req dto.ClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ClientHandler] Create: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.CreateClient(c.Request.Context(), req); err != nil {
		log.Printf("[ClientHandler] Create: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "Client created successfully"})
}

func (h *ClientHandler) GetClientByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("[ClientHandler] GetByID: invalid UUID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	res, err := h.service.GetClientByID(c.Request.Context(), id)
	if err != nil {
		log.Printf("[ClientHandler] GetByID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ClientHandler) GetAllClients(c *gin.Context) {
	res, err := h.service.GetAllClients(c.Request.Context())
	if err != nil {
		log.Printf("[ClientHandler] GetAll: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ClientHandler) UpdateClient(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("[ClientHandler] Update: invalid UUID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var req dto.ClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ClientHandler] Update: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.ID = id

	if err := h.service.UpdateClient(c.Request.Context(), req); err != nil {
		log.Printf("[ClientHandler] Update: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Client updated successfully"})
}

func (h *ClientHandler) DeleteClient(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("[ClientHandler] Delete: invalid UUID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	if err := h.service.DeleteClient(c.Request.Context(), id); err != nil {
		log.Printf("[ClientHandler] Delete: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Client deleted successfully"})
}
