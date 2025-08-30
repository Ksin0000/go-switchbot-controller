package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
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

// DeviceLists holds both physical and virtual devices.
type DeviceLists struct {
	Devices         []switchbot.Device        `json:"devices"`
	InfraredRemotes []switchbot.InfraredDevice `json:"infraredRemotes"`
}

// GetAllDeviceLists returns lists of all SwitchBot devices.
func (a *App) GetAllDeviceLists() (DeviceLists, error) {
	devices, virtualDevices, err := a.client.Device().List(a.ctx)
	if err != nil {
		return DeviceLists{}, err
	}
	return DeviceLists{Devices: devices, InfraredRemotes: virtualDevices}, nil
}

// ControlInfraredRemote sends a command to a virtual infrared remote device.
func (a *App) ControlInfraredRemote(deviceID string, command string) error {
	//_, err := a.client.InfraredDevice(deviceID).Command(a.ctx, command, "")
	//if err != nil {
	//	return fmt.Errorf("failed to send command to device %s: %w", deviceID, err)
	//}
	return nil
}

func (a *App) TurnLight(deviceID string, command string) error {
	err := a.client.Device().Command(a.ctx, deviceID, switchbot.TurnOnCommand())
	if err != nil {
		return fmt.Errorf("failed to send command to device %s: %w", deviceID, err)
	}
	return err
}

// TurnFirstLight finds the first infrared remote of type "Light" and turns it on.
func (a *App) TurnFirstLight() (string, error) {
	// 1. Get all device lists
	_, virtualDevices, err := a.client.Device().List(a.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get device list: %w", err)
	}

	// 2. Find the first light
	var lightDeviceID string
	var lightDeviceName string
	for _, dev := range virtualDevices {
		if strings.Contains(string(dev.Type), string(switchbot.Light)) {
			lightDeviceID = dev.ID
			lightDeviceName = dev.Name
			break
		}
	}

	if lightDeviceID == "" {
		return "照明タイプの赤外線リモコンが見つかりませんでした。", nil
	}

	// 3. Send the "turnOn" command
	err = a.TurnLight(lightDeviceID, "turnOn")
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s をオンにしました。", lightDeviceName), nil
}
