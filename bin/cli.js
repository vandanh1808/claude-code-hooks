#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const HOOKS_DIR = path.join(__dirname, "..", "hooks");

const REGISTRY = {
  "ping-on-done": {
    file: "ping-on-done.sh",
    description: "Beep when Claude finishes a task",
    event: "Stop",
    matcher: "",
  },
  "skill-usage-logger": {
    file: "skill-usage-logger.sh",
    description: "Log which skills Claude uses to .claude/skill-usage.log",
    event: "PostToolUse",
    matcher: "Skill",
  },
};

function printUsage() {
  console.log(`
claude-code-hooks — install hooks for Claude Code

Usage:
  npx claude-code-hooks                     Install all hooks
  npx claude-code-hooks add <hook-name>     Install a specific hook
  npx claude-code-hooks list                List available hooks
  npx claude-code-hooks remove <hook-name>  Remove a hook

Available hooks:`);
  for (const [name, hook] of Object.entries(REGISTRY)) {
    console.log(`  ${name.padEnd(24)} ${hook.description}`);
  }
  console.log();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSettings(projectDir) {
  const settingsPath = path.join(projectDir, ".claude", "settings.json");
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  }
  return {};
}

function writeSettings(projectDir, settings) {
  const settingsPath = path.join(projectDir, ".claude", "settings.json");
  ensureDir(path.dirname(settingsPath));
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}

function hookCommand(filename) {
  return `bash "\${CLAUDE_PROJECT_DIR}/.claude/hooks/${filename}"`;
}

function addHookToSettings(settings, hookDef) {
  if (!settings.hooks) settings.hooks = {};
  const event = hookDef.event;

  if (!settings.hooks[event]) settings.hooks[event] = [];

  const matchers = hookDef.matchers || [hookDef.matcher];
  const cmd = hookCommand(hookDef.file);

  for (const matcher of matchers) {
    const existing = settings.hooks[event].find(
      (entry) => entry.matcher === matcher
    );

    if (existing) {
      const alreadyHas = existing.hooks.some((h) => h.command === cmd);
      if (!alreadyHas) {
        existing.hooks.push({ type: "command", command: cmd });
      }
    } else {
      settings.hooks[event].push({
        matcher: matcher,
        hooks: [{ type: "command", command: cmd }],
      });
    }
  }

  return settings;
}

function removeHookFromSettings(settings, hookDef) {
  if (!settings.hooks) return settings;
  const event = hookDef.event;
  if (!settings.hooks[event]) return settings;

  const cmd = hookCommand(hookDef.file);

  settings.hooks[event] = settings.hooks[event]
    .map((entry) => {
      entry.hooks = entry.hooks.filter((h) => h.command !== cmd);
      return entry;
    })
    .filter((entry) => entry.hooks.length > 0);

  if (settings.hooks[event].length === 0) delete settings.hooks[event];
  if (Object.keys(settings.hooks).length === 0) delete settings.hooks;

  return settings;
}

function installHook(projectDir, name) {
  const hookDef = REGISTRY[name];
  if (!hookDef) {
    console.error(`Unknown hook: ${name}`);
    console.error(`Available: ${Object.keys(REGISTRY).join(", ")}`);
    process.exit(1);
  }

  const hooksDir = path.join(projectDir, ".claude", "hooks");
  ensureDir(hooksDir);

  const src = path.join(HOOKS_DIR, hookDef.file);
  const dest = path.join(hooksDir, hookDef.file);
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);

  let settings = readSettings(projectDir);
  settings = addHookToSettings(settings, hookDef);
  writeSettings(projectDir, settings);

  console.log(`  [+] ${name} — ${hookDef.description}`);
}

function removeHook(projectDir, name) {
  const hookDef = REGISTRY[name];
  if (!hookDef) {
    console.error(`Unknown hook: ${name}`);
    process.exit(1);
  }

  const dest = path.join(projectDir, ".claude", "hooks", hookDef.file);
  if (fs.existsSync(dest)) fs.unlinkSync(dest);

  let settings = readSettings(projectDir);
  settings = removeHookFromSettings(settings, hookDef);
  writeSettings(projectDir, settings);

  console.log(`  [-] ${name} removed`);
}

// --- Main ---
const args = process.argv.slice(2);
const projectDir = process.cwd();
const command = args[0];

if (command === "list" || command === "ls") {
  console.log("\nAvailable hooks:");
  for (const [name, hook] of Object.entries(REGISTRY)) {
    console.log(`  ${name.padEnd(24)} ${hook.description}`);
  }
  console.log();
} else if (command === "add") {
  const name = args[1];
  if (!name) {
    console.error("Usage: claude-code-hooks add <hook-name>");
    process.exit(1);
  }
  console.log(`\nInstalling hook to ${projectDir}:`);
  installHook(projectDir, name);
  console.log("\nDone!\n");
} else if (command === "remove" || command === "rm") {
  const name = args[1];
  if (!name) {
    console.error("Usage: claude-code-hooks remove <hook-name>");
    process.exit(1);
  }
  removeHook(projectDir, name);
  console.log("\nDone!\n");
} else if (command === "help" || command === "--help" || command === "-h") {
  printUsage();
} else {
  console.log(`\nInstalling all hooks to ${projectDir}:`);
  for (const name of Object.keys(REGISTRY)) {
    installHook(projectDir, name);
  }
  console.log("\nDone!\n");
}
