package main

import (
    "context"

    appcore "go-switchbot-controller/internal"
    "github.com/nasa9084/go-switchbot/v4"
)

// App 構造体
type App struct {
    ctx context.Context
    svc *appcore.SwitchBotService
}

// NewApp は新しい App 構造体を作成します。
func NewApp() *App { return &App{svc: appcore.NewSwitchBotService()} }

// startup はアプリ起動時に呼び出され、コンテキストを保存します。
func (a *App) startup(ctx context.Context) { a.ctx = ctx }

// SleepNow はPCを即時スリープさせます（内部実装に委譲）
func (a *App) SleepNow() string { return appcore.SleepNow() }
// ShutdownNow はPCを即時シャットダウンします（内部実装に委譲）
func (a *App) ShutdownNow() string { return appcore.ShutdownNow() }

// DeviceLists は物理デバイスと赤外線リモコンの両方を保持します。
type DeviceLists struct {
    Devices         []switchbot.Device         `json:"devices"`
    InfraredRemotes []switchbot.InfraredDevice `json:"infraredRemotes"`
}

// InitSwitchBotAndFetchDevices は段階的な初期化を行い、デバイス一覧を返します。
func (a *App) InitSwitchBotAndFetchDevices() (DeviceLists, error) {
    devices, virtuals, err := a.svc.InitAndFetchDevices(a.ctx)
    if err != nil {
        return DeviceLists{}, err
    }
    return DeviceLists{Devices: devices, InfraredRemotes: virtuals}, nil
}

// ControlInfraredRemote は仮想の赤外線リモコンにコマンドを送信します。
func (a *App) ControlInfraredRemote(deviceID string, command string) error {
    return a.svc.ControlIR(a.ctx, deviceID, command)
}

// EnvStatus はUIに返す環境値（温度・湿度・照度）だけを持つ簡易構造体です。
type EnvStatus struct {
    Temperature float64 `json:"temperature"`
    Humidity    int     `json:"humidity"`
    LightLevel  int     `json:"lightLevel"`
}

// GetDeviceEnvStatus は指定デバイス（例: Hub 2）の環境値を返します。
func (a *App) GetDeviceEnvStatus(deviceID string) (EnvStatus, error) {
    st, err := a.svc.GetStatus(a.ctx, deviceID)
    if err != nil {
        return EnvStatus{}, err
    }
    return EnvStatus{Temperature: st.Temperature, Humidity: st.Humidity, LightLevel: st.LightLevel}, nil
}
