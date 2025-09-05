package internal

import (
    "context"

    sb "github.com/nasa9084/go-switchbot/v4"
)

// SwitchBotClient is a small interface wrapper around the go-switchbot client.
type SwitchBotClient interface {
    List(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error)
    SendRawCommand(ctx context.Context, deviceID string, req sb.DeviceCommandRequest) error
}

// sbClient is the concrete implementation using the upstream library.
type sbClient struct{ raw *sb.Client }

// NewClient creates a new SwitchBot client using the given config.
func NewClient(cfg Config) SwitchBotClient { return &sbClient{raw: sb.New(cfg.Token, cfg.Secret)} }

func (c *sbClient) List(ctx context.Context) ([]sb.Device, []sb.InfraredDevice, error) {
    return c.raw.Device().List(ctx)
}

func (c *sbClient) SendRawCommand(ctx context.Context, deviceID string, req sb.DeviceCommandRequest) error {
    return c.raw.Device().Command(ctx, deviceID, req)
}
