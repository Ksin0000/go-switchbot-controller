//go:build !windows

package internal

// SleepNow は非Windows環境では未対応です。
func SleepNow() string {
    return "この機能はWindowsでのみ利用可能です。"
}

// ShutdownNow は非Windows環境では未対応です。
func ShutdownNow() string {
    return "この機能はWindowsでのみ利用可能です。"
}
