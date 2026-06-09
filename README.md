# vt-claude-hooks

Pre-built hooks for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — install with one command, works on Windows, macOS, and Linux.

## Quick Start

```bash
npx vt-claude-hooks
```

This installs all available hooks into your project's `.claude/` directory and configures `.claude/settings.json` automatically.

## Usage

```bash
npx vt-claude-hooks                          # Install all hooks
npx vt-claude-hooks add <hook-name>          # Install a specific hook
npx vt-claude-hooks remove <hook-name>       # Remove a hook
npx vt-claude-hooks list                     # List available hooks
```

## Available Hooks

| Hook | Event | Description |
|------|-------|-------------|
| `ping-on-done` | `Stop` | Plays a beep sound when Claude finishes a task |
| `skill-usage-logger` | `PostToolUse` | Logs `Skill`, `Read`, `Write`, `Edit` tool calls to `.claude/skill-usage.log` |

### ping-on-done

Plays a short notification sound when Claude completes a response.

- **Windows** — PowerShell `[console]::beep()`
- **macOS** — `afplay` system sound
- **Linux** — `paplay` freedesktop sound

### skill-usage-logger

Logs every tool call with timestamps to `.claude/skill-usage.log`:

```
[2026-06-09T07:08:26Z] SKILL_CALLED: draw-erd
[2026-06-09T07:08:26Z] FILE_READ: docs/erd/erd-diagram.drawio
[2026-06-09T07:08:44Z] FILE_WRITTEN: docs/reviews/skill-execution-log.md
[2026-06-09T07:08:52Z] FILE_EDITED: src/app.module.ts
```

No dependencies required — uses `sed` (available in any bash environment).

## What It Does

Running `npx vt-claude-hooks` in your project directory:

1. Creates `.claude/hooks/` and copies hook scripts
2. Creates or updates `.claude/settings.json` with hook configuration
3. Does **not** overwrite existing hooks config — safe to run multiple times

## File Structure

```
your-project/
└── .claude/
    ├── settings.json          # Hook configuration (created/updated)
    ├── skill-usage.log        # Logger output (created at runtime)
    └── hooks/
        ├── ping-on-done.sh
        └── skill-usage-logger.sh
```

## Requirements

- Node.js >= 14
- Bash (Git Bash on Windows, or native on macOS/Linux)

## License

MIT
