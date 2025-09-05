package internal

import (
    "context"
    "fmt"
    "strings"

    sb "github.com/nasa9084/go-switchbot/v4"
)

// SwitchBotService は UI 層から呼び出されるアプリケーションのユースケースを提供します。
type SwitchBotService struct {
    client SwitchBotClient
}

// NewSwitchBotService は新しい SwitchBotService を作成します。
func NewSwitchBotService() *SwitchBotService {
    return &SwitchBotService{}
}

// ensureClient は環境変数から SwitchBot クライアントを遅延初期化します。
func (s *SwitchBotService) ensureClient() error {
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

// InitAndFetchDevices は資格情報と接続性の確認のためにデバイス一覧を取得します。
func (s *SwitchBotService) InitAndFetchDevices(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error) {
    if err := s.ensureClient(); err != nil {
        return nil, nil, err
    }
    devices, virtuals, err := s.client.List(ctx)
    if err != nil {
        return nil, nil, fmt.Errorf("SwitchBot API への接続に失敗しました: %w", err)
    }
    return devices, virtuals, nil
}

// ControlIR: 赤外線リモコンへコマンドを送信します。
func (s *SwitchBotService) ControlIR(ctx context.Context, deviceID, command string) error {
    if err := s.ensureClient(); err != nil {
        return err
    }

    // 前処理: コマンドを正規化
    cmd := strings.TrimSpace(command)
    if cmd == "" {
        return fmt.Errorf("無効なコマンドです（空文字）")
    }

    // エアコン(setAll)のショートハンド: "setAll:26,1,3,on" の形式を許可
    if strings.HasPrefix(cmd, "setAll:") {
        param := strings.TrimPrefix(cmd, "setAll:")
        // SwitchBot API仕様:
        //   command: "setAll"
        //   parameter: "{temperature},{mode},{fan speed},{power state}"
        // 例: "26,1,3,on"
        req := sb.DeviceCommandRequest{Command: "setAll", Parameter: param, CommandType: "command"}
        if err := s.client.SendRawCommand(ctx, deviceID, req); err != nil {
            return fmt.Errorf("IRエアコン(setAll)送信失敗: %w", err)
        }
        return nil
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

// GetStatus は指定デバイスの最新ステータスを返します（Hub 2 などの温湿度・照度取得に使用）。
func (s *SwitchBotService) GetStatus(ctx context.Context, deviceID string) (sb.DeviceStatus, error) {
    if err := s.ensureClient(); err != nil {
        return sb.DeviceStatus{}, err
    }
    st, err := s.client.Status(ctx, deviceID)
    if err != nil {
        return sb.DeviceStatus{}, fmt.Errorf("デバイスステータス取得に失敗しました: %w", err)
    }
    return st, nil
}
