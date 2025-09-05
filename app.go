package main

import (
    "context"

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

// ControlInfraredRemote sends a command to a virtual infrared remote device.
func (a *App) ControlInfraredRemote(deviceID string, command string) error {
    return a.svc.ControlIR(a.ctx, deviceID, command)
}
