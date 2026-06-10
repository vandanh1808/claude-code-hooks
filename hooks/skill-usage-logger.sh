#!/usr/bin/env bash
# Log which Claude Code skill was invoked and prompt Claude to explain why

LOG_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/skill-usage.log"
mkdir -p "$(dirname "$LOG_FILE")"

input=$(cat)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

tool_name=$(echo "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [ "$tool_name" = "Skill" ]; then
  skill=$(echo "$input" | sed -n 's/.*"skill"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  echo "[$timestamp] SKILL: ${skill:-unknown}" >> "$LOG_FILE"
  echo "[skill-usage-logger] Skill '${skill:-unknown}' logged to $LOG_FILE. Before proceeding, you MUST append your explanation to that same log file — why you selected this skill, what in the user's request matched, and what alternatives you considered. Use the Edit or Bash tool to append lines starting with 'Reason:' right after the SKILL entry."
fi

exit 0
