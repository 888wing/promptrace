#!/usr/bin/env bash
# stats.sh — Quick stats about Promptrace data
set -euo pipefail

TRACES_DIR=".promptrace/traces"
COMPONENT_MAP=".promptrace/component-map.json"

if [ ! -d ".promptrace" ]; then
  echo "Error: .promptrace/ not found. Run init-promptrace.sh first."
  exit 1
fi

# Count trace files
if [ -d "$TRACES_DIR" ]; then
  TRACE_COUNT=$(find "$TRACES_DIR" -maxdepth 1 -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
else
  TRACE_COUNT=0
fi

# Count components
if [ -f "$COMPONENT_MAP" ]; then
  if command -v jq >/dev/null 2>&1; then
    COMPONENT_COUNT=$(jq '.components | length' "$COMPONENT_MAP" 2>/dev/null || echo 0)
  else
    # Fallback: count top-level keys in components object
    # This is a rough heuristic — counts lines with pattern "key": {
    COMPONENT_COUNT=$(grep -c '"[^"]*"\s*:\s*{' "$COMPONENT_MAP" 2>/dev/null || echo 0)
    # Subtract 1 for the "components" key itself if present
    if [ "$COMPONENT_COUNT" -gt 0 ]; then
      COMPONENT_COUNT=$((COMPONENT_COUNT - 1))
    fi
    [ "$COMPONENT_COUNT" -lt 0 ] && COMPONENT_COUNT=0
  fi
else
  COMPONENT_COUNT=0
fi

echo "Promptrace Stats"

if [ "$TRACE_COUNT" -eq 0 ]; then
  echo "  Traces:     0"
  echo "  Components: $COMPONENT_COUNT"
  echo "  No traces recorded yet."
  exit 0
fi

# Extract dates from trace filenames (expected format: YYYY-MM-DD-*.md or similar with date prefix)
DATES=$(find "$TRACES_DIR" -maxdepth 1 -type f -name '*.md' -exec basename {} \; 2>/dev/null | \
  grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort)

if [ -n "$DATES" ]; then
  FIRST_DATE=$(echo "$DATES" | head -1)
  LAST_DATE=$(echo "$DATES" | tail -1)
else
  FIRST_DATE="unknown"
  LAST_DATE="unknown"
fi

echo "  Traces:     $TRACE_COUNT"
echo "  Components: $COMPONENT_COUNT"
echo "  First trace: $FIRST_DATE"
echo "  Last trace:  $LAST_DATE"
