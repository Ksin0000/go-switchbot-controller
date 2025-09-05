package internal

import (
    "context"

    sb "github.com/nasa9084/go-switchbot/v4"
)

// SwitchBotClient は go-switchbot クライアントの小さなインターフェースラッパーです。
type SwitchBotClient interface {
    List(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error)
    SendRawCommand(ctx context.Context, deviceID string, req sb.DeviceCommandRequest) error
    // Status は物理デバイスの現在ステータスを返します。
    Status(ctx context.Context, deviceID string) (sb.DeviceStatus, error)
}

// sbClient は上流ライブラリを用いた具象実装です。
type sbClient struct{ raw *sb.Client }

// NewClient は指定された設定で新しい SwitchBot クライアントを作成します。
func NewClient(cfg Config) SwitchBotClient { return &sbClient{raw: sb.New(cfg.Token, cfg.Secret)} }

func (c *sbClient) List(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error) {
    return c.raw.Device().List(ctx)
}

func (c *sbClient) SendRawCommand(ctx context.Context, deviceID string, req sb.DeviceCommandRequest) error {
    return c.raw.Device().Command(ctx, deviceID, req)
}

func (c *sbClient) Status(ctx context.Context, deviceID string) (sb.DeviceStatus, error) {
    return c.raw.Device().Status(ctx, deviceID)
}
