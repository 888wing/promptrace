import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const START_MARKER = '<!-- promptrace:start:config -->';
const END_MARKER = '<!-- promptrace:end:config -->';

/**
 * Adds or updates a managed Promptrace section in CLAUDE.md.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @param {{ componentRoots: string[] }} projectInfo
 * @returns {{ action: 'created' | 'updated' | 'appended', path: string }}
 */
export function injectClaudeMd(projectDir, projectInfo) {
  const claudeMdPath = join(projectDir, 'CLAUDE.md');

  const rootsList = projectInfo.componentRoots
    .map((r) => '`' + r + '`')
    .join(', ');

  const section = [
    '',
    START_MARKER,
    '## Promptrace',
    '',
    'This project uses [Promptrace](https://github.com/888wing/promptrace) for automatic documentation maintenance.',
    '',
    '**Commands:**',
    '- `/trace` — Record a semantic trace of recent changes',
    '- `/trace-sync` — Sync documentation from traces',
    '- `/trace-review` — Detect documentation drift',
    '- `/trace-map` — Generate architecture docs',
    '- `/trace-log [component]` — Query change history',
    '- `/trace-commit` — Generate commit message from trace',
    '',
    `**Component Roots:** ${rootsList}`,
    END_MARKER,
  ].join('\n');

  // 1. CLAUDE.md does not exist — create it
  if (!existsSync(claudeMdPath)) {
    writeFileSync(claudeMdPath, `# CLAUDE.md\n${section}\n`, 'utf-8');
    return { action: 'created', path: claudeMdPath };
  }

  // CLAUDE.md exists — read it
  const existing = readFileSync(claudeMdPath, 'utf-8');

  // 2. Has markers — replace content between them (inclusive)
  const startIdx = existing.indexOf(START_MARKER);
  const endIdx = existing.indexOf(END_MARKER);

  if (startIdx !== -1 && endIdx !== -1) {
    const before = existing.slice(0, startIdx).replace(/\n$/, '');
    const after = existing.slice(endIdx + END_MARKER.length);
    const updated = before + section + after;
    writeFileSync(claudeMdPath, updated, 'utf-8');
    return { action: 'updated', path: claudeMdPath };
  }

  // 3. No markers — append section at end
  const appended = existing.trimEnd() + '\n' + section + '\n';
  writeFileSync(claudeMdPath, appended, 'utf-8');
  return { action: 'appended', path: claudeMdPath };
}
