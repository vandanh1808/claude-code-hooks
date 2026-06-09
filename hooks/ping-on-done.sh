#!/usr/bin/env bash
# Play a ping sound when Claude finishes a task
# Windows: PowerShell beep | macOS: afplay | Linux: paplay/beep
if command -v powershell &>/dev/null; then
  powershell -c "[console]::beep(1000,150); Start-Sleep -Milliseconds 80; [console]::beep(1500,150)"
elif [ "$(uname)" = "Darwin" ]; then
  afplay /System/Library/Sounds/Ping.aiff &>/dev/null
elif command -v paplay &>/dev/null; then
  paplay /usr/share/sounds/freedesktop/stereo/complete.oga &>/dev/null
fi
