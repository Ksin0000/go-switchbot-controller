package internal

import (
    "fmt"
    "os"
)

// Config は認証情報や任意設定を保持します。
type Config struct {
    Token  string
    Secret string
}

// LoadFromEnv は環境変数から SwitchBot の認証情報を読み込みます。
func LoadFromEnv() (Config, error) {
    token := os.Getenv("SWITCHBOT_TOKEN")
    secret := os.Getenv("SECRET")
    if token == "" || secret == "" {
        return Config{}, fmt.Errorf("SWITCHBOT_TOKEN/SECRET が未設定です。.env を作成してアプリを再起動してください。")
    }
    return Config{Token: token, Secret: secret}, nil
}
