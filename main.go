package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/yourusername/go-switchbot-controller/switchbot"
)

func main() {
	// .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Fatalf(".envファイルの読み込みに失敗: %v", err)
	}

	// 環境変数からトークンとデバイスIDを取得
	token := os.Getenv("SWITCHBOT_TOKEN")
	deviceID := os.Getenv("DEVICE_ID")

	if token == "" || deviceID == "" {
		log.Fatal("SWITCHBOT_TOKEN または DEVICE_ID が設定されていません")
	}

	// トークンを設定
	client := switchbot.NewClient(token)

	// デバイスのステータスを取得
	status, err := client.GetDeviceStatus(deviceID)
	if err != nil {
		log.Fatalf("エラー: %v", err)
	}

	fmt.Printf("デバイス名: %s\n", status.Body.DeviceName)
	fmt.Printf("電源状態: %s\n", status.Body.Power)
	fmt.Printf("温度: %d\n", status.Body.Temperature)
	fmt.Printf("湿度: %d%%\n", status.Body.Humidity)
} 