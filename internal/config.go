package internal

import (
    "fmt"
    "os"
)

// Config holds credentials and optional settings.
type Config struct {
    Token  string
    Secret string
}

// LoadFromEnv loads SwitchBot credentials from environment variables.
func LoadFromEnv() (Config, error) {
    token := os.Getenv("SWITCHBOT_TOKEN")
    secret := os.Getenv("SECRET")
    if token == "" || secret == "" {
        return Config{}, fmt.Errorf("SWITCHBOT_TOKEN/SECRET が未設定です。.env を作成してアプリを再起動してください。")
    }
    return Config{Token: token, Secret: secret}, nil
}
