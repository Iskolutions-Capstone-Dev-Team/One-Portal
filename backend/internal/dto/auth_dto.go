package dto

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type CallbackRequest struct {
	Code string `json:"code" binding:"required"`
}

type CallbackPayload struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	Code         string `json:"code"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

type MeResponse struct {
	FirstName      string   `json:"first_name"`
	MiddleName     string   `json:"middle_name"`
	LastName       string   `json:"last_name"`
	NameSuffix     string   `json:"name_suffix"`
	Email          string   `json:"email"`
	AllowedClients []string `json:"allowed_clients"`
}

type JWK struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	Alg string `json:"alg"`
	Crv string `json:"crv"`
	N   string `json:"n"`
	E   string `json:"e"`
	X   string `json:"x"`
	Y   string `json:"y"`
}