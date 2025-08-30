package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/nasa9084/go-switchbot/v4"
)

// App struct
type App struct {
	ctx    context.Context
	client *switchbot.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	token := os.Getenv("SWITCHBOT_TOKEN")
	secret := os.Getenv("SECRET")
	a.client = switchbot.New(token, secret)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// SleepNow はPCを即時スリープさせます
func (a *App) SleepNow() string {
	// OSがWindowsであるかを確認します
	if runtime.GOOS != "windows" {
		return "この機能はWindowsでのみ利用可能です。"
	}

	// 即時スリープコマンドを実行
	exec.Command("powercfg", "-h", "off").Run()
	exec.Command("rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0").Run()
	exec.Command("powercfg", "-h", "on").Run()
	return "PCをスリープさせました。"
}

// GetDeviceList returns a list of SwitchBot devices.
func (a *App) GetDeviceList() ([]switchbot.Device, error) {
	devices, _, err := a.client.Device().List(a.ctx)
	if err != nil {
		return nil, err
	}
	return devices, nil
}

// HandleCeilingLight is a placeholder function for ceiling light control.
func (a *App) HandleCeilingLight() {
	// 今後の実装のために空の関数を用意
}

// HandleTv is a placeholder function for TV control.
func (a *App) HandleTv() {
	// 今後の実装のために空の関数を用意
}
