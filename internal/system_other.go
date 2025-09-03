//go:build !windows

package internal

// SleepNow is not supported on non-Windows platforms.
func SleepNow() string {
    return "この機能はWindowsでのみ利用可能です。"
}

