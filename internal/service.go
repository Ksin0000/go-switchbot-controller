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

// （削除）GetAllDevices: 未使用のため削除しました。

// ControlIR: 赤外線リモコンへコマンドを送信します。
func (s *Service) ControlIR(ctx context.Context, deviceID, command string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }

    // 前処理: コマンドを正規化
    cmd := strings.TrimSpace(command)
    if cmd == "" {
        return fmt.Errorf("無効なコマンドです（空文字）")
    }

    // 1回目: 標準コマンドとして送信（commandType: "command"）
    req := sb.DeviceCommandRequest{Command: cmd, Parameter: "default", CommandType: "command"}
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

