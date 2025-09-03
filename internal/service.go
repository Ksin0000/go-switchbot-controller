package internal

import (
    "context"
    "fmt"
    "strings"

    sb "github.com/nasa9084/go-switchbot/v4"
)

// Service provides application use-cases to be invoked from the UI layer.
type Service struct {
    client SwitchBotClient
}

func NewService() *Service {
    return &Service{}
}

// ensureClient lazily initialises the SwitchBot client from env.
func (s *Service) ensureClient() error {
    if s.client != nil {
        return nil
    }
    cfg, err := LoadFromEnv()
    if err != nil {
        return err
    }
    s.client = NewClient(cfg)
    return nil
}

// InitAndFetchDevices performs credentials + connectivity checks by fetching devices.
func (s *Service) InitAndFetchDevices(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error) {
    if err := s.ensureClient(); err != nil {
        return nil, nil, err
    }
    devices, virtuals, err := s.client.List(ctx)
    if err != nil {
        return nil, nil, fmt.Errorf("SwitchBot API への接続に失敗しました: %w", err)
    }
    return devices, virtuals, nil
}

// GetAllDevices fetches both physical and infrared devices.
func (s *Service) GetAllDevices(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error) {
    if err := s.ensureClient(); err != nil {
        return nil, nil, err
    }
    return s.client.List(ctx)
}

// ControlIR sends a command to an infrared remote.
func (s *Service) ControlIR(ctx context.Context, deviceID, command string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }

    // 1st: 標準コマンドとして送信（commandType: "command"）
    req := sb.DeviceCommandRequest{Command: command, Parameter: "default", CommandType: "command"}
    if err := s.client.SendRawCommand(ctx, deviceID, req); err != nil {
        // 未対応の場合は customize で再送（学習リモコンのボタン名）
        if strings.Contains(err.Error(), "command is not supported") {
            req.CommandType = "customize"
            if err2 := s.client.SendRawCommand(ctx, deviceID, req); err2 != nil {
                return fmt.Errorf("IRコマンド送信失敗（customize）: %w", err2)
            }
            return nil
        }
        return fmt.Errorf("IRコマンド送信失敗: %w", err)
    }
    return nil
}

// LightTurnOn turns on a light device (infrared light uses IR command, but here
// we keep the existing physical device command as in the original code).
func (s *Service) LightTurnOn(ctx context.Context, deviceID string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }
    return s.client.TurnOnDevice(ctx, deviceID)
}

// DeviceTurnOff turns off a physical device (e.g., Plug, Bot if supported).
func (s *Service) DeviceTurnOff(ctx context.Context, deviceID string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }
    return s.client.TurnOffDevice(ctx, deviceID)
}

// PowerOffDevices sends power-off to selected devices.
// - infraredMap: map[deviceID]command (e.g., "turnOff" or custom learned button name)
// - physicalIDs: slice of physical device IDs to turn off
func (s *Service) PowerOffDevices(ctx context.Context, infraredMap map[string]string, physicalIDs []string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }

    // IR first
    for id, cmd := range infraredMap {
        if strings.TrimSpace(cmd) == "" {
            cmd = "turnOff"
        }
        req := sb.DeviceCommandRequest{Command: cmd, Parameter: "default", CommandType: "command"}
        if err := s.client.SendRawCommand(ctx, id, req); err != nil {
            // Fallback to customize
            if strings.Contains(err.Error(), "command is not supported") {
                req.CommandType = "customize"
                if err2 := s.client.SendRawCommand(ctx, id, req); err2 != nil {
                    return fmt.Errorf("IRコマンド送信失敗（customize）: %w", err2)
                }
            } else {
                return fmt.Errorf("IRコマンド送信失敗: %w", err)
            }
        }
    }

    // Physical next
    for _, id := range physicalIDs {
        if err := s.client.TurnOffDevice(ctx, id); err != nil {
            return fmt.Errorf("物理デバイスOFF失敗(%s): %w", id, err)
        }
    }
    return nil
}

// TurnFirstLight finds the first infrared remote of type "Light" and turns it on.
func (s *Service) TurnFirstLight(ctx context.Context) (string, error) {
    if err := s.ensureClient(); err != nil {
        return "", err
    }
    _, virtuals, err := s.client.List(ctx)
    if err != nil {
        return "", fmt.Errorf("failed to get device list: %w", err)
    }

    var lightID, lightName string
    for _, dev := range virtuals {
        if strings.Contains(string(dev.Type), string(sb.Light)) {
            lightID = dev.ID
            lightName = dev.Name
            break
        }
    }
    if lightID == "" {
        return "照明タイプの赤外線リモコンが見つかりませんでした。", nil
    }
    if err := s.LightTurnOn(ctx, lightID); err != nil {
        return "", err
    }
    return fmt.Sprintf("%s をオンにしました。", lightName), nil
}
