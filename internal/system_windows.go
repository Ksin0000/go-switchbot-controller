//go:build windows

package internal

import (
    "os/exec"
)

// SleepNow puts the PC to sleep immediately (Windows only).
func SleepNow() string {
    exec.Command("powercfg", "-h", "off").Run()
    exec.Command("rundll32.exe", "powrprof.dll,SetSuspendState", "0,1,0").Run()
    exec.Command("powercfg", "-h", "on").Run()
    return "PCをスリープさせました。"
}

// ShutdownNow shuts down Windows immediately.
func ShutdownNow() string {
    exec.Command("shutdown", "/s", "/f", "/t", "0").Run()
    return "PCの電源をオフにします。"
}
