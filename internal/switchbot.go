package internal

import (
    "context"

    sb "github.com/nasa9084/go-switchbot/v4"
)

// SwitchBotClient は go-switchbot クライアントの小さなインターフェースラッパーです。
type SwitchBotClient interface {
    List(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error)
    SendRawCommand(ctx context.Context, deviceID string, req sb.DeviceCommandRequest) error
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
