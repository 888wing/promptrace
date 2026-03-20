# Promptrace

**The flight recorder for AI coding — keeps your docs in sync with your code.**

[![npm version](https://img.shields.io/npm/v/promptrace)](https://www.npmjs.com/package/promptrace)
[![license](https://img.shields.io/npm/l/promptrace)](https://github.com/888wing/promptrace/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/promptrace)](https://nodejs.org)

A [Claude Code skill](https://docs.anthropic.com/en/docs/claude-code/skills) that automatically maintains documentation as AI agents modify your codebase. Zero dependencies. Fully local.

## The Problem

A single Claude Code session can modify 40+ files across your project. When the session ends, your README, CHANGELOG, and architecture docs remain frozen in the past. Future-you opens the project a week later and has no idea what happened. Future AI sessions hallucinate against stale docs. The gap between code reality and written documentation grows with every session.

## The Solution

Promptrace captures the semantic meaning of code changes — not just diffs, but *why* things changed — and keeps your documentation synchronized. It turns Claude into a code historian that records traces, detects drift, and regenerates docs on command. Everything stays local. No cloud, no accounts, no runtime dependencies.

## Quick Start

```bash
npx promptrace init        # Set up tracking in your project
```

```bash
# ... make some code changes with Claude Code ...
/trace                     # Record what changed and why
/trace-sync                # Update your docs automatically
```

That's it. Your README, CHANGELOG, and ARCHITECTURE.md stay in sync.

## Commands

| Command | Description |
|---------|-------------|
| `/trace` | Record a semantic trace of recent changes |
| `/trace-sync` | Sync documentation from traces |
| `/trace-review` | Detect documentation drift |
| `/trace-map` | Generate architecture docs with dependency graphs |
| `/trace-log [component]` | Query change history |
| `/trace-commit` | Generate conventional commit message |
| `/trace-init` | Initialize tracking (in-session alternative to CLI) |

## How It Works

Promptrace has two layers: a **CLI** that scaffolds the project, and a **Skill** that provides AI intelligence inside Claude Code sessions.

The CLI (`npx promptrace init`) creates a `.promptrace/` directory and installs the skill into `.claude/skills/promptrace/`. The skill teaches Claude how to record traces, detect drift, and regenerate docs — all through natural language commands.

All data lives locally in `.promptrace/`. Source code is never modified — only documentation files are touched. The skill uses progressive disclosure: `SKILL.md` is the entry point, with `references/` and `templates/` loaded on demand.

```
.promptrace/
├── traces/           # Semantic change records (timestamped JSON)
├── config.json       # Sync targets, strategies, language settings
├── references/       # Deep-dive docs loaded on demand
└── templates/        # Output templates for each doc type
```

Zero runtime dependencies. No background processes. No watchers. Runs only when you invoke a command.

## Installation

**Recommended** — per-project setup:

```bash
npx promptrace init
```

**Global** — install for all projects:

```bash
npx promptrace install -g
```

**Manual** — copy the skill directly:

```bash
cp -r skill/ .claude/skills/promptrace/
```

## Sync Strategies

| Strategy | Behaviour | Used For |
|----------|-----------|----------|
| `append-managed` | Only modifies `<!-- promptrace -->` markers | README, CLAUDE.md |
| `prepend` | Adds new entries at top | CHANGELOG |
| `overwrite` | Regenerates entirely from traces | ARCHITECTURE.md |
| `merge` | Preserves human-written sections | Mixed docs |

## Supported Languages

TypeScript/JavaScript, Python, Rust, Go, Swift, GDScript (Godot).

## Roadmap

- [x] Phase 1: Core skill + CLI
- [ ] Phase 1.5: Session briefing, drift detection, CLAUDE.md auto-sync
- [ ] Phase 2: Decision memory, trace archival, quality self-check
- [ ] Phase 3: MCP server, cross-platform (Cursor, Codex, Windsurf), web dashboard

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss larger changes.

```bash
git clone https://github.com/888wing/promptrace.git
cd promptrace
node bin/promptrace.js init   # dogfood it
```

## License

[MIT](LICENSE)
