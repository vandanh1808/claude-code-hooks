#!/usr/bin/env bash
# Log Skill / Read / Write / Edit tool calls to .claude/skill-usage.log

LOG_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/skill-usage.log"
mkdir -p "$(dirname "$LOG_FILE")"

input=$(cat)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

extract() {
  echo "$input" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1
}

tool_name=$(extract tool_name)

case "$tool_name" in
  Skill)
    skill=$(extract skill)
    echo "[$timestamp] SKILL_CALLED: ${skill:-unknown}" >> "$LOG_FILE"
    ;;
  Read)
    file=$(extract file_path)
    echo "[$timestamp] FILE_READ: ${file:-unknown}" >> "$LOG_FILE"
    ;;
  Write)
    file=$(extract file_path)
    echo "[$timestamp] FILE_WRITTEN: ${file:-unknown}" >> "$LOG_FILE"
    ;;
  Edit)
    file=$(extract file_path)
    echo "[$timestamp] FILE_EDITED: ${file:-unknown}" >> "$LOG_FILE"
    ;;
esac

exit 0
