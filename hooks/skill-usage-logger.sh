#!/usr/bin/env bash
# Log which Claude Code skill was invoked + the args/context that triggered it

LOG_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/skill-usage.log"
mkdir -p "$(dirname "$LOG_FILE")"

input=$(cat)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

tool_name=$(echo "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [ "$tool_name" = "Skill" ]; then
  skill=$(echo "$input" | sed -n 's/.*"skill"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  args=$(echo "$input" | sed -n 's/.*"args"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  echo "[$timestamp] SKILL: ${skill:-unknown}" >> "$LOG_FILE"
  if [ -n "$args" ]; then
    echo "  Context: $args" >> "$LOG_FILE"
  fi
fi

exit 0
