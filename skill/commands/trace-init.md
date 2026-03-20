---
description: Initialize Promptrace in the current project
---

Set up Promptrace tracking in this project. Use this when the CLI (`npx promptrace init`) was not used.

## Instructions

1. Check if `.promptrace/` already exists — if so, ask whether to reconfigure or abort
2. Detect the project:
   - Read package.json, Cargo.toml, pyproject.toml, go.mod, etc.
   - Identify language, framework, and likely component roots
   - Follow @references/component_patterns.md for detection patterns
3. Create `.promptrace/` directory structure:
   - `.promptrace/config.json` with detected values
   - `.promptrace/component-map.json` with initial empty state
   - `.promptrace/traces/` directory
   - `.promptrace/archive/` directory
4. Perform initial component scan:
   - Walk each directory in `component_roots`
   - Identify components using patterns from @references/component_patterns.md
   - Write discovered components to `component-map.json`
5. Offer to add `.promptrace/traces/` and `.promptrace/drift.json` to `.gitignore`
6. Print setup summary with detected values and next steps

$ARGUMENTS
