package main

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
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
