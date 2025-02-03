package switchbot

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client はSwitchBot APIクライアントを表します
type Client struct {
	token      string
	baseURL    string
	httpClient *http.Client
}

// NewClient は新しいSwitchBot APIクライアントを作成します
func NewClient(token string) *Client {
	return &Client{
		token:   token,
		baseURL: "https://api.switch-bot.com/v1.1",
		httpClient: &http.Client{
			Timeout: time.Second * 10,
		},
	}
}

// DeviceStatus はデバイスのステータス情報を表します
type DeviceStatus struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message"`
	Body       struct {
		DeviceID    string `json:"deviceId"`
		DeviceName  string `json:"deviceName"`
		DeviceType  string `json:"deviceType"`
		Power       string `json:"power"`
		Temperature int    `json:"temperature"`
		Humidity    int    `json:"humidity"`
	} `json:"body"`
}

// GetDeviceStatus は特定のデバイスのステータスを取得します
func (c *Client) GetDeviceStatus(deviceID string) (*DeviceStatus, error) {
	url := fmt.Sprintf("%s/devices/%s/status", c.baseURL, deviceID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("リクエストの作成に失敗: %w", err)
	}

	// 必要なヘッダーを設定
	req.Header.Set("Authorization", c.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("APIリクエストに失敗: %w", err)
	}
	defer resp.Body.Close()

	var status DeviceStatus
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		return nil, fmt.Errorf("レスポンスのデコードに失敗: %w", err)
	}

	return &status, nil
} 