#!/usr/bin/env bash
# init-codetape.sh — Creates .codetape/ folder structure with default config
set -euo pipefail

CODETAPE_DIR=".codetape"

if [ -d "$CODETAPE_DIR" ]; then
  echo "Warning: $CODETAPE_DIR already exists. Aborting."
  exit 1
fi

PROJECT_NAME=$(basename "$(pwd)")
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$CODETAPE_DIR/traces"
mkdir -p "$CODETAPE_DIR/archive"

cat > "$CODETAPE_DIR/config.json" <<EOF
{
  "version": "0.1.0",
  "project_name": "$PROJECT_NAME",
  "language": "unknown",
  "framework": null,
  "tracking_mode": "manual",
  "exclude_patterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
    ".next",
    "vendor"
  ],
  "component_roots": [
    "src"
  ]
}
EOF

cat > "$CODETAPE_DIR/component-map.json" <<EOF
{
  "updated_at": "$NOW",
  "components": {},
  "relationships": []
}
EOF

echo "Codetape initialized in $CODETAPE_DIR/"
echo "  Created: config.json, component-map.json"
echo "  Directories: traces/, archive/"
