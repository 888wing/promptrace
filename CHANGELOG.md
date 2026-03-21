# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-21

### Added
- `serve` command: live-reloading dashboard at localhost:3210
- 6-panel dashboard: project overview, trace timeline, component map, drift status, decisions, TODOs
- SSE-based auto-refresh when .codetape/ data changes
- Mermaid.js component dependency visualization
- Dark theme matching codetape.win brand (amber + cassette aesthetic)

## [0.1.1] - 2026-03-21

### Fixed
- CLI: CLAUDE.md and .gitignore injection now runs automatically (no separate prompts)
- CLI: Piped input (`echo "Y" | npx codetape init`) no longer skips CLAUDE.md injection
- CLI: Detect CLAUDE.md in both project root and `.claude/` directory

### Changed
- CLI: Reduced interactive prompts from 4 to 2 (reconfigure + proceed)
- CLI: Non-TTY environments use sensible defaults for all prompts

## [0.1.0] - 2026-03-20

### Added
- Initial release
- CLI: `npx codetape init`, `install`, `uninstall`, `status`, `doctor`
- Skill: SKILL.md core prompt with code historian persona
- Commands: `/trace`, `/trace-sync`, `/trace-map`, `/trace-review`, `/trace-init`, `/trace-log`, `/trace-commit`
- References: trace schema, sync strategies, component patterns, drift detection
- Templates: readme section, component doc, architecture overview, changelog entry, session summary
- Zero runtime dependencies
