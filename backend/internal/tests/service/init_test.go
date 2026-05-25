package service_test

import (
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
)

func TestInitServicesBasic(t *testing.T) {
	repos := &initializers.Repositories{Log: nil, RefreshToken: nil}
	services := initializers.InitServices(repos)
	if services == nil {
		t.Fatal("expected non-nil services")
	}
	if services.Log == nil {
		t.Fatal("expected services.Log non-nil")
	}
	if services.RefreshToken == nil {
		t.Fatal("expected services.RefreshToken non-nil")
	}
}
