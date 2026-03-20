#!/usr/bin/env bash
# drift-check.sh — Quick timestamp comparison for drift detection
set -euo pipefail

COMPONENT_MAP=".codetape/component-map.json"

if [ ! -f "$COMPONENT_MAP" ]; then
  echo "Error: $COMPONENT_MAP not found. Run init-codetape.sh first."
  exit 1
fi

# Doc files to compare against
DOC_FILES=("README.md" "CLAUDE.md" "docs/ARCHITECTURE.md")

# Get file mtime as YYYY-MM-DD (cross-platform)
get_mtime() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo ""
    return
  fi
  if stat --version >/dev/null 2>&1; then
    # GNU stat (Linux)
    date -d "$(stat -c '%Y' "$file" | xargs -I{} date -d @{} +%Y-%m-%d)" +%Y-%m-%d 2>/dev/null || stat -c '%y' "$file" | cut -d' ' -f1
  else
    # BSD stat (macOS)
    stat -f '%Sm' -t '%Y-%m-%d' "$file"
  fi
}

# Extract component names and last_modified dates
extract_components() {
  if command -v jq >/dev/null 2>&1; then
    jq -r '.components | to_entries[] | "\(.key)|\(.value.last_modified // "unknown")"' "$COMPONENT_MAP" 2>/dev/null
  else
    # Fallback: grep/sed parsing
    # Extracts "name": { ... "last_modified": "date" ... } pairs
    grep -oE '"[^"]+"\s*:\s*\{[^}]*"last_modified"\s*:\s*"[^"]*"' "$COMPONENT_MAP" 2>/dev/null | \
      sed -E 's/"([^"]+)"\s*:\s*\{.*"last_modified"\s*:\s*"([^"]*)".*/\1|\2/' | \
      grep -v '^components|' | grep -v '^updated_at|'
  fi
}

DRIFT_FOUND=false

while IFS='|' read -r name last_modified; do
  [ -z "$name" ] && continue
  code_date="${last_modified:0:10}"

  for doc in "${DOC_FILES[@]}"; do
    doc_date=$(get_mtime "$doc")
    [ -z "$doc_date" ] && continue

    if [[ "$code_date" > "$doc_date" ]]; then
      echo "[DRIFT] $name: code updated $code_date, $doc last modified $doc_date"
      DRIFT_FOUND=true
    fi
  done
done < <(extract_components)

if [ "$DRIFT_FOUND" = false ]; then
  echo "No drift detected."
fi
