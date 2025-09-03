package main

import (
    "context"
    "fmt"

    appcore "go-switchbot-controller/internal"
    "github.com/nasa9084/go-switchbot/v4"
)

// App struct
type App struct {
    ctx context.Context
    svc *appcore.Service
}

// NewApp creates a new App application struct
func NewApp() *App { return &App{svc: appcore.NewService()} }

// startup is called when the app starts. The context is saved
func (a *App) startup(ctx context.Context) { a.ctx = ctx }

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string { return fmt.Sprintf("Hello %s, It's show time!", name) }

// SleepNow はPCを即時スリープさせます（内部実装に委譲）
func (a *App) SleepNow() string { return appcore.SleepNow() }
// ShutdownNow はPCを即時シャットダウンします（内部実装に委譲）
func (a *App) ShutdownNow() string { return appcore.ShutdownNow() }

// DeviceLists holds both physical and virtual devices.
type DeviceLists struct {
    Devices         []switchbot.Device         `json:"devices"`
    InfraredRemotes []switchbot.InfraredDevice `json:"infraredRemotes"`
}

// InitSwitchBotAndFetchDevices performs staged initialization and returns device lists.
func (a *App) InitSwitchBotAndFetchDevices() (DeviceLists, error) {
    devices, virtuals, err := a.svc.InitAndFetchDevices(a.ctx)
    if err != nil {
        return DeviceLists{}, err
    }
    return DeviceLists{Devices: devices, InfraredRemotes: virtuals}, nil
}

// GetAllDeviceLists returns lists of all SwitchBot devices.
func (a *App) GetAllDeviceLists() (DeviceLists, error) {
    devices, virtuals, err := a.svc.GetAllDevices(a.ctx)
    if err != nil {
        return DeviceLists{}, err
    }
    return DeviceLists{Devices: devices, InfraredRemotes: virtuals}, nil
}

// ControlInfraredRemote sends a command to a virtual infrared remote device.
func (a *App) ControlInfraredRemote(deviceID string, command string) error {
    return a.svc.ControlIR(a.ctx, deviceID, command)
}

// TurnLight turns on the specified light device. The second argument is kept for compatibility.
func (a *App) TurnLight(deviceID string, _ string) error {
    if err := a.svc.LightTurnOn(a.ctx, deviceID); err != nil {
        return fmt.Errorf("failed to send command to device %s: %w", deviceID, err)
    }
    return nil
}

// TurnFirstLight finds the first infrared remote of type "Light" and turns it on.
func (a *App) TurnFirstLight() (string, error) { return a.svc.TurnFirstLight(a.ctx) }

// TurnOffDevice turns off a physical device by ID.
func (a *App) TurnOffDevice(deviceID string) error {
    if err := a.svc.DeviceTurnOff(a.ctx, deviceID); err != nil {
        return fmt.Errorf("failed to send off command to device %s: %w", deviceID, err)
    }
    return nil
}
