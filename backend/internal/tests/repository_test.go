package tests

import (
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/One-Portal/internal/initializers"
)

func TestInitRepositoriesBasic(t *testing.T) {
	repos := initializers.InitRepositories(nil)
	if repos == nil {
		t.Fatal("expected non-nil repositories")
	}
	if repos.Log == nil {
		t.Fatal("expected repos.Log non-nil")
	}
	// repository.Close should be safe to call even when db is nil.
	repos.Log.Close()
}
