package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/google/uuid"
)

// 認証情報を.envファイルから取得
func getAuthInfo() (string, string) {
	// .envファイルの読み込み
	err := godotenv.Load()
	if err != nil {
		log.Fatal(".envファイルの読み込みに失敗しました: ", err)
	}

	token := os.Getenv("SWITCHBOT_TOKEN")
	secret := os.Getenv("SECRET")
	
	if token == "" {
		fmt.Println(".envファイルにSWITCHBOT_TOKENが設定されていません")
		os.Exit(1)
	}
	if secret == "" {
		fmt.Println(".envファイルにSECRETが設定されていません") 
		os.Exit(1)
	}
	
	return token, secret
}

// getAuthHeaders は認証用のヘッダーを生成します
func getAuthHeaders() map[string]string {
	token, secret := getAuthInfo()
	nonce := uuid.New().String()
	timestamp := strconv.FormatInt(time.Now().UnixNano()/1e6, 10)

	// 署名文字列の作成
	stringToSign := token + timestamp + nonce
	
	// HMAC-SHA256の計算
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(stringToSign))
	sign := base64.StdEncoding.EncodeToString(h.Sum(nil))

	// ヘッダーの作成
	headers := map[string]string{
		"Authorization": token,
		"sign":         sign,
		"t":           timestamp,
		"nonce":       nonce,
		"Content-Type": "application/json",
	}

	return headers
}

// getDeviceList はデバイス一覧を取得します
func getDeviceList() {
	url := "https://api.switch-bot.com/v1.1/devices"
	
	// リクエストの作成
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("リクエストの作成に失敗しました: %v\n", err)
		return
	}

	// ヘッダーの設定
	headers := getAuthHeaders()
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// リクエストの実行
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("リクエストの実行に失敗しました: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// レスポンスの読み取り
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("レスポンスの読み取りに失敗しました: %v\n", err)
		return
	}

	// ステータスコードの表示
	fmt.Printf("ステータスコード: %d\n", resp.StatusCode)

	// レスポンスの整形表示
	var prettyJSON map[string]interface{}
	if err := json.Unmarshal(body, &prettyJSON); err != nil {
		fmt.Printf("JSONのパースに失敗しました: %v\n", err)
		return
	}
	
	// レスポンスの表示
	fmt.Println("レスポンス:")
	jsonBytes, _ := json.MarshalIndent(prettyJSON, "", "    ")
	fmt.Println(string(jsonBytes))
}

func main() {
	fmt.Println("SwitchBot APIテスト開始")
	getDeviceList()
} 