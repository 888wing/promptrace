# Promptrace MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and publish the Promptrace npm package — a zero-dependency CLI + Claude Code skill that auto-maintains documentation as AI agents modify codebases.

**Architecture:** An npm package with two layers: (1) a Node.js CLI (`bin/promptrace.js`) that scaffolds `.promptrace/` and copies skill files to `.claude/`, and (2) a Claude Code skill (`skill/SKILL.md` + commands + references + templates) that provides all AI intelligence via prompt engineering. Zero runtime dependencies — all file I/O uses native `node:fs` and `node:path`.

**Tech Stack:** Node.js 18+ (native modules only), Markdown (skill/commands/references/templates), JSON (data schemas), Bash (optional helper scripts)

---

## Task 1: Project Scaffold + package.json

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `CHANGELOG.md`

**Step 1: Initialize git repo**

```bash
cd /Users/chuisiufai/Projects/Codetape
git init
```

**Step 2: Create package.json**

```json
{
  "name": "promptrace",
  "version": "0.1.0",
  "description": "The flight recorder for AI coding — keeps your docs in sync with your code",
  "bin": {
    "promptrace": "./bin/promptrace.js"
  },
  "files": [
    "bin/",
    "src/",
    "skill/",
    "scripts/"
  ],
  "keywords": [
    "claude-code", "skill", "agent-skill", "documentation",
    "claude-md", "agents-md", "ai-coding", "mcp",
    "developer-tools", "changelog", "readme",
    "cursor", "codex", "windsurf", "aider"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "type": "module",
  "license": "MIT",
  "author": "Nelson <888wing>",
  "repository": {
    "type": "git",
    "url": "https://github.com/888wing/promptrace"
  },
  "homepage": "https://github.com/888wing/promptrace#readme",
  "bugs": {
    "url": "https://github.com/888wing/promptrace/issues"
  }
}
```

**Step 3: Create .gitignore**

```
node_modules/
.DS_Store
*.log
```

**Step 4: Create LICENSE (MIT)**

Standard MIT license with author: Nelson / 888wing, year: 2026.

**Step 5: Create CHANGELOG.md**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-20

### Added
- Initial release
- CLI: `npx promptrace init`, `install`, `uninstall`, `status`, `doctor`
- Skill: SKILL.md core prompt with code historian persona
- Commands: `/trace`, `/trace-sync`, `/trace-map`, `/trace-review`, `/trace-init`, `/trace-log`, `/trace-commit`
- References: trace schema, sync strategies, component patterns, drift detection
- Templates: readme section, component doc, architecture overview, changelog entry, session summary
- Zero runtime dependencies
```

**Step 6: Create all directories**

```bash
mkdir -p bin src/cli src/utils skill/commands skill/references skill/templates scripts
```

**Step 7: Commit**

```bash
git add package.json .gitignore LICENSE CHANGELOG.md
git commit -m "chore: initialize promptrace project scaffold"
```

---

## Task 2: SKILL.md — Core Prompt

**Files:**
- Create: `skill/SKILL.md`

This is the brain of Promptrace. ~350 lines. Claude reads this to become a "code historian."

**Step 1: Write skill/SKILL.md**

The SKILL.md must contain these sections:
1. **Identity & Role** (~20 lines) — "Code historian" persona, reader context (future developer 3 months later)
2. **Quality Standards** (~30 lines) — Good vs bad trace examples, length constraints (<150 lines/trace)
3. **Session Protocol** (~40 lines) — Auto-briefing when `.promptrace/` detected, auto-trace trigger heuristic, CLAUDE.md sync recommendation
4. **Command Routing** (~30 lines) — Maps `/trace`, `/trace-sync`, `/trace-map`, `/trace-review`, `/trace-init`, `/trace-log`, `/trace-commit` to reference docs
5. **Component Detection** (~20 lines) — Pointer to `references/component_patterns.md`, generic heuristic
6. **Data Integrity** (~20 lines) — Verify paths in component-map.json, flag deprecated components, detect untracked files

Key constraints:
- Under 350 lines total
- Progressive disclosure: point to references/ and templates/ instead of inlining everything
- Security: never include API keys, tokens, or credentials in traces
- Write scope: only `.promptrace/`, `.claude/`, and configured sync targets

**Step 2: Verify line count**

```bash
wc -l skill/SKILL.md
```
Expected: under 350 lines.

**Step 3: Commit**

```bash
git add skill/SKILL.md
git commit -m "feat: add SKILL.md core prompt — code historian persona"
```

---

## Task 3: Reference Documents

**Files:**
- Create: `skill/references/trace_schema.md` (~80 lines)
- Create: `skill/references/sync_strategies.md` (~100 lines)
- Create: `skill/references/component_patterns.md` (~120 lines)
- Create: `skill/references/drift_detection.md` (~60 lines)

**Step 1: Write trace_schema.md**

Format specification for trace logs. Must include:
- Complete trace markdown template (as defined in tech summary section 4.3)
- Field-by-field requirements (session, duration, scope, impact, summary, affected components, technical decisions, dependency changes, TODOs)
- Good trace example (semantic, explains why, actionable TODOs)
- Bad trace example (just lists files changed, no reasoning)
- Quality checklist: summary <=2 sentences, every component has action verb, at least one decision with reasoning, TODOs are specific

**Step 2: Write sync_strategies.md**

Four sync strategy definitions:
- `append-managed`: Only modify content between `<!-- promptrace:start:X -->` and `<!-- promptrace:end:X -->` markers. Include marker syntax, examples, and rule that human content outside markers is NEVER touched.
- `prepend`: Add new content at top of file. Used for CHANGELOG.
- `overwrite`: Regenerate entire file. Used for docs/ARCHITECTURE.md.
- `merge`: Intelligently merge preserving human edits. Used for mixed docs.
- Conflict resolution rules when markers are missing or malformed
- Diff preview requirement before any write

**Step 3: Write component_patterns.md**

Component detection patterns by language/framework:
- **TypeScript/JavaScript**: React components (export default function/class), Next.js pages/api routes, Express routes, services (export class *Service), hooks (use*.ts)
- **Python**: FastAPI/Flask routes, Django views/models, classes, functions with decorators
- **Rust**: pub struct, pub fn, impl blocks, mod declarations
- **Go**: exported functions (capitalized), struct types, interfaces
- **Swift**: class/struct/protocol declarations, SwiftUI views (View conformance)
- **Generic fallback**: files in component_roots with exported symbols

**Step 4: Write drift_detection.md**

Drift severity classification rules:
- **High**: README mentions features that no longer exist, CLAUDE.md architecture section contradicts component-map, AGENTS.md references deleted files
- **Medium**: Component descriptions outdated (>5 traces since last doc update), missing docs for new components added in last 3 traces
- **Low**: Minor wording inconsistencies, timestamps stale but content still accurate
- Timestamp comparison logic: compare `last_modified` in component-map.json against document file mtime
- Semantic comparison guidelines: Claude compares doc descriptions against recent trace summaries

**Step 5: Verify line counts**

```bash
wc -l skill/references/*.md
```
Expected: trace_schema ~80, sync_strategies ~100, component_patterns ~120, drift_detection ~60.

**Step 6: Commit**

```bash
git add skill/references/
git commit -m "feat: add reference docs — trace schema, sync strategies, component patterns, drift detection"
```

---

## Task 4: Output Templates

**Files:**
- Create: `skill/templates/readme_section.md` (~20 lines)
- Create: `skill/templates/component_doc.md` (~30 lines)
- Create: `skill/templates/architecture_overview.md` (~40 lines)
- Create: `skill/templates/changelog_entry.md` (~15 lines)
- Create: `skill/templates/session_summary.md` (~15 lines)

**Step 1: Write readme_section.md**

Template for managed README sections. Uses `<!-- promptrace:start:architecture -->` markers. Includes project overview, component list table, recent changes summary.

**Step 2: Write component_doc.md**

Template for individual component documentation at `docs/components/{name}.md`. Includes component name, path, type, description, dependencies, dependents, recent change history from traces.

**Step 3: Write architecture_overview.md**

Template for `docs/ARCHITECTURE.md`. Includes system overview, mermaid dependency graph (generated from component-map.json relationships), component table with descriptions, and recent decisions from traces.

**Step 4: Write changelog_entry.md**

Template for CHANGELOG entries in Keep a Changelog format. Groups changes by Added/Changed/Fixed/Removed. Derives from most recent trace.

**Step 5: Write session_summary.md**

Template for terminal output after `/trace` completes. Compact (10 lines max). Shows: trace saved path, components affected count, decisions captured, TODOs created, suggested next action.

**Step 6: Commit**

```bash
git add skill/templates/
git commit -m "feat: add output templates — readme, component, architecture, changelog, session"
```

---

## Task 5: Custom Command Definitions

**Files:**
- Create: `skill/commands/trace.md`
- Create: `skill/commands/trace-sync.md`
- Create: `skill/commands/trace-map.md`
- Create: `skill/commands/trace-review.md`
- Create: `skill/commands/trace-init.md`
- Create: `skill/commands/trace-log.md`
- Create: `skill/commands/trace-commit.md`

Each command file follows Claude Code custom command format:

**Step 1: Write trace.md**

```markdown
---
description: Record a semantic trace of recent code changes
---

Analyse the current git diff (or recent file modifications if no git) and generate a trace log.

Steps:
1. Read .promptrace/config.json for project context
2. Read .promptrace/component-map.json for component registry
3. Analyse git diff --stat and git diff for changed files
4. Read @skill/references/trace_schema.md for the trace format specification
5. Generate trace log following the schema
6. Save to .promptrace/traces/YYYY-MM-DD_HH-MM_{slug}.md
7. Update component-map.json with affected components
8. Output terminal summary using @skill/templates/session_summary.md

$ARGUMENTS
```

**Step 2: Write trace-sync.md**

Syncs documentation from traces. Reads sync_targets from config.json, applies strategies from `@skill/references/sync_strategies.md`, shows diff preview before writing.

**Step 3: Write trace-map.md**

Generates architecture docs. Reads component-map.json, generates `docs/ARCHITECTURE.md` using `@skill/templates/architecture_overview.md`. Optionally generates individual component docs.

**Step 4: Write trace-review.md**

Detects documentation drift. Uses `@skill/references/drift_detection.md` rules, writes results to `.promptrace/drift.json`, offers to run `/trace-sync` for high-severity issues.

**Step 5: Write trace-init.md**

Scaffolds `.promptrace/` in current project. Detects language/framework, creates config.json, runs initial component scan, writes component-map.json. For use inside Claude Code when CLI wasn't used.

**Step 6: Write trace-log.md**

Queries change history. Accepts component name, date range, or tag. Searches `.promptrace/traces/` and presents results chronologically.

**Step 7: Write trace-commit.md**

Generates conventional commit message from most recent trace. Reads trace, formats as `feat/fix/refactor(scope): description`, lists key changes, flags breaking changes, offers to execute `git commit`.

**Step 8: Commit**

```bash
git add skill/commands/
git commit -m "feat: add 7 custom command definitions — trace, sync, map, review, init, log, commit"
```

---

## Task 6: CLI Utilities

**Files:**
- Create: `src/utils/detect-project.js`
- Create: `src/utils/scaffold.js`
- Create: `src/utils/copy-skill.js`
- Create: `src/utils/inject-claude-md.js`

All utilities use native Node.js only (`node:fs`, `node:path`, `node:os`). ESM format.

**Step 1: Write detect-project.js**

```javascript
// Detects project language, framework, and component roots
// Checks: package.json (next/react/vue/express), Cargo.toml, pyproject.toml,
//         go.mod, Package.swift, project.godot
// Returns: { name, language, framework, componentRoots }
```

Export a single function `detectProject(projectDir)` that:
- Reads package.json → extracts name, detects framework from dependencies
- Falls back to folder name if no package.json
- Checks for language-specific manifest files
- Returns sensible `componentRoots` defaults based on detected framework (e.g., `["src/components", "src/services", "src/lib"]` for Next.js)

**Step 2: Write scaffold.js**

```javascript
// Creates .promptrace/ directory structure and generates config.json + component-map.json
```

Export `scaffold(projectDir, projectInfo)` that:
- Creates `.promptrace/`, `.promptrace/traces/`, `.promptrace/archive/`
- Generates `config.json` from projectInfo (following schema in tech summary 4.1)
- Generates empty `component-map.json` with `{ updated_at, components: {}, relationships: [] }`
- Returns paths of created files

**Step 3: Write copy-skill.js**

```javascript
// Copies skill files to .claude/skills/promptrace/ and commands to .claude/commands/
```

Export `copySkill(projectDir, packageDir, { global })` that:
- Resolves source: skill/ directory relative to the npm package location
- For local install: copies to `{projectDir}/.claude/skills/promptrace/`
- For global install (-g): copies to `~/.claude/skills/promptrace/`
- Copies command .md files to `.claude/commands/`
- Creates directories if they don't exist
- Returns list of copied files

**Step 4: Write inject-claude-md.js**

```javascript
// Adds or updates managed section in CLAUDE.md
```

Export `injectClaudeMd(projectDir)` that:
- Checks if CLAUDE.md exists
- If exists: looks for `<!-- promptrace:start:config -->` markers
  - If markers found: replaces content between them
  - If no markers: appends managed section at end
- If not exists: creates minimal CLAUDE.md with Promptrace section
- The managed section includes: Promptrace is installed, trace commands available, component roots

**Step 5: Verify all utilities parse correctly**

```bash
node -e "import('./src/utils/detect-project.js')"
node -e "import('./src/utils/scaffold.js')"
node -e "import('./src/utils/copy-skill.js')"
node -e "import('./src/utils/inject-claude-md.js')"
```
Expected: no syntax errors.

**Step 6: Commit**

```bash
git add src/utils/
git commit -m "feat: add CLI utilities — detect-project, scaffold, copy-skill, inject-claude-md"
```

---

## Task 7: CLI Commands

**Files:**
- Create: `src/cli/init.js`
- Create: `src/cli/install.js`
- Create: `src/cli/uninstall.js`
- Create: `src/cli/status.js`
- Create: `src/cli/doctor.js`

**Step 1: Write init.js**

Export `init(args)` that follows the flow from tech summary 3.3:
1. Check if `.promptrace/` exists → offer reconfigure or abort
2. Call `detectProject()` to get project info
3. Display detected config, ask user to confirm (via readline)
4. Call `scaffold()` to create `.promptrace/` structure
5. Call `copySkill()` to install skill to `.claude/`
6. Ask if user wants CLAUDE.md injection → call `injectClaudeMd()`
7. Ask if user wants .gitignore update → append `.promptrace/traces/` and `.promptrace/drift.json`
8. Print success summary with next steps

User interaction via `node:readline/promises` — createInterface, question, close.

**Step 2: Write install.js**

Export `install(args)` that:
- Checks for `-g` / `--global` flag
- Calls `copySkill()` with appropriate target
- Skips project scaffold (no `.promptrace/` creation)
- Prints installed file list

**Step 3: Write uninstall.js**

Export `uninstall(args)` that:
- Confirms with user before proceeding
- Removes `.claude/skills/promptrace/` directory
- Removes Promptrace command files from `.claude/commands/`
- Does NOT remove `.promptrace/` (data preservation — warn user)
- Prints cleanup summary

**Step 4: Write status.js**

Export `status(args)` that:
- Checks if `.promptrace/` exists
- Reads `config.json` → displays project name, language, framework
- Counts traces in `traces/` directory
- Shows last trace date
- Checks if skill is installed in `.claude/skills/promptrace/`
- Shows component count from `component-map.json`

**Step 5: Write doctor.js**

Export `doctor(args)` that verifies installation integrity:
- Check `.promptrace/` exists and has config.json
- Check `.promptrace/component-map.json` exists and is valid JSON
- Check `.claude/skills/promptrace/SKILL.md` exists
- Check all 7 command files exist in `.claude/commands/`
- Check all 4 reference files exist
- Check all 5 template files exist
- Report pass/fail for each check with fix suggestions

**Step 6: Verify all commands parse**

```bash
node -e "import('./src/cli/init.js')"
node -e "import('./src/cli/install.js')"
node -e "import('./src/cli/uninstall.js')"
node -e "import('./src/cli/status.js')"
node -e "import('./src/cli/doctor.js')"
```

**Step 7: Commit**

```bash
git add src/cli/
git commit -m "feat: add CLI commands — init, install, uninstall, status, doctor"
```

---

## Task 8: CLI Entry Point

**Files:**
- Create: `bin/promptrace.js`

**Step 1: Write bin/promptrace.js**

```javascript
#!/usr/bin/env node

// Route to CLI commands based on process.argv
// Commands: init, install, uninstall, status, doctor
// Flags: --version, --help, -g/--global
```

The entry point must:
- Parse `process.argv[2]` as the command name
- Handle `--version` (read from package.json)
- Handle `--help` (print usage)
- Handle unknown commands (print help + exit 1)
- Import and call the appropriate command module
- Handle uncaught errors gracefully (print message, exit 1)

**Step 2: Make it executable**

```bash
chmod +x bin/promptrace.js
```

**Step 3: Test CLI locally**

```bash
node bin/promptrace.js --version
node bin/promptrace.js --help
node bin/promptrace.js doctor
```

**Step 4: Test npx locally**

```bash
npm link
npx promptrace --help
npm unlink promptrace
```

**Step 5: Commit**

```bash
git add bin/
git commit -m "feat: add CLI entry point — bin/promptrace.js with command routing"
```

---

## Task 9: Helper Scripts

**Files:**
- Create: `scripts/init-promptrace.sh`
- Create: `scripts/drift-check.sh`
- Create: `scripts/stats.sh`

These are optional accelerators — Claude can do everything without them.

**Step 1: Write init-promptrace.sh**

Creates `.promptrace/` folder structure with empty config.json and component-map.json. Simple `mkdir -p` + heredoc JSON writes.

**Step 2: Write drift-check.sh**

Quick timestamp comparison: compares `component-map.json` component `last_modified` dates against doc file mtimes. Outputs components where code is newer than docs.

**Step 3: Write stats.sh**

Counts traces, components, last activity date. One-liner outputs for quick status check.

**Step 4: Make executable**

```bash
chmod +x scripts/*.sh
```

**Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: add helper scripts — init, drift-check, stats"
```

---

## Task 10: README

**Files:**
- Create: `README.md`

**Step 1: Write README.md**

Structure:
1. **Hero**: Name, one-liner tagline, badges (npm version, license, node version)
2. **Problem**: 3-sentence description of Documentation Drift
3. **What Promptrace Does**: Before/after comparison table
4. **Quick Start**: `npx promptrace init` → `/trace` → `/trace-sync` (3 commands)
5. **Commands Reference**: Table of all 7 `/trace-*` commands with descriptions
6. **How It Works**: Brief architecture explanation (CLI + Skill, zero deps, all local)
7. **Installation Options**: npx, global install, manual, Claude Code plugin
8. **Configuration**: config.json key fields explained
9. **Sync Strategies**: Table of 4 strategies
10. **Roadmap**: Phase 1/1.5/2/3 timeline
11. **Contributing**: Standard open-source section
12. **License**: MIT

Key selling points to emphasize:
- Zero dependencies
- All local (no cloud, no API calls)
- Works with Claude Code, Cursor, Codex, Windsurf
- Open source (MIT)

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick start, commands reference, and architecture overview"
```

---

## Task 11: GitHub Repo + Push

**Step 1: Create GitHub repo**

```bash
gh repo create 888wing/promptrace --public --description "The flight recorder for AI coding — keeps your docs in sync with your code" --source . --push
```

**Step 2: Add topics**

```bash
gh repo edit 888wing/promptrace --add-topic claude-code,ai-coding,documentation,developer-tools,changelog,mcp,cursor,windsurf
```

**Step 3: Verify**

```bash
gh repo view 888wing/promptrace
```

---

## Task 12: npm Login + Publish

**Step 1: Login to npm**

```bash
npm login
```
This will open browser for authentication. User must complete interactively.

**Step 2: Dry-run publish**

```bash
npm publish --dry-run
```
Verify: correct files included (bin/, src/, skill/, scripts/), no unexpected files.

**Step 3: Publish**

```bash
npm publish --access public
```

**Step 4: Verify**

```bash
npm view promptrace
npx promptrace --help
```

---

## Task 13: End-to-End Verification

**Step 1: Test on a fresh project**

```bash
mkdir /tmp/test-promptrace && cd /tmp/test-promptrace
npm init -y
npx promptrace init
```

Verify:
- `.promptrace/` created with config.json and component-map.json
- `.claude/skills/promptrace/SKILL.md` exists
- All 7 command files in `.claude/commands/`
- All 4 reference files present
- All 5 template files present

**Step 2: Run doctor**

```bash
npx promptrace doctor
```
Expected: all checks pass.

**Step 3: Run status**

```bash
npx promptrace status
```
Expected: shows project info, 0 traces, skill installed.

**Step 4: Clean up**

```bash
rm -rf /tmp/test-promptrace
```

---

## Execution Order Summary

| Task | Description | Depends On | Estimated |
|------|-------------|------------|-----------|
| 1 | Project scaffold + package.json | — | 10 min |
| 2 | SKILL.md core prompt | — | 30 min |
| 3 | Reference documents (4 files) | — | 25 min |
| 4 | Output templates (5 files) | — | 15 min |
| 5 | Custom commands (7 files) | Tasks 2-4 | 20 min |
| 6 | CLI utilities (4 files) | — | 25 min |
| 7 | CLI commands (5 files) | Task 6 | 25 min |
| 8 | CLI entry point | Task 7 | 10 min |
| 9 | Helper scripts (3 files) | — | 10 min |
| 10 | README | Tasks 1-9 | 15 min |
| 11 | GitHub repo + push | Task 10 | 5 min |
| 12 | npm login + publish | Task 11 | 5 min |
| 13 | E2E verification | Task 12 | 10 min |

**Parallelizable:** Tasks 2, 3, 4, 6, 9 can all run in parallel (no dependencies).
**Sequential chain:** 6 → 7 → 8 (CLI builds bottom-up), 10 → 11 → 12 → 13 (publish chain).

**Total estimated: ~3.5 hours of focused work.**
