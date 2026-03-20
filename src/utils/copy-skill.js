import { cpSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

/**
 * Copies skill files from the npm package to the user's .claude/ directory.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @param {{ global?: boolean }} options
 * @returns {{ skillFiles: string[], commandFiles: string[] }}
 */
export function copySkill(projectDir, options = {}) {
  const skillFiles = [];
  const commandFiles = [];

  // 1. Resolve package root (this file lives at src/utils/copy-skill.js)
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const packageRoot = join(__dirname, '..', '..'); // src/utils/ -> package root
  const skillSrc = join(packageRoot, 'skill');

  // 2. Determine target base directory
  const targetBase = options.global
    ? join(homedir(), '.claude')
    : join(projectDir, '.claude');

  // 3. Copy skill/ -> targetBase/skills/codetape/
  const skillDest = join(targetBase, 'skills', 'codetape');
  mkdirSync(skillDest, { recursive: true });

  // Copy SKILL.md
  const skillMdSrc = join(skillSrc, 'SKILL.md');
  if (existsSync(skillMdSrc)) {
    const skillMdDest = join(skillDest, 'SKILL.md');
    cpSync(skillMdSrc, skillMdDest);
    skillFiles.push(skillMdDest);
  }

  // Copy references/ directory
  const refsSrc = join(skillSrc, 'references');
  if (existsSync(refsSrc)) {
    const refsDest = join(skillDest, 'references');
    cpSync(refsSrc, refsDest, { recursive: true });
    collectFiles(refsSrc, refsDest, skillFiles);
  }

  // Copy templates/ directory
  const templatesSrc = join(skillSrc, 'templates');
  if (existsSync(templatesSrc)) {
    const templatesDest = join(skillDest, 'templates');
    cpSync(templatesSrc, templatesDest, { recursive: true });
    collectFiles(templatesSrc, templatesDest, skillFiles);
  }

  // 4. Copy skill/commands/*.md -> targetBase/commands/
  const commandsSrc = join(skillSrc, 'commands');
  if (existsSync(commandsSrc)) {
    const commandsDest = join(targetBase, 'commands');
    mkdirSync(commandsDest, { recursive: true });

    const entries = readdirSync(commandsSrc);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        const src = join(commandsSrc, entry);
        const dest = join(commandsDest, entry);
        cpSync(src, dest);
        commandFiles.push(dest);
      }
    }
  }

  return { skillFiles, commandFiles };
}

/**
 * Recursively collects destination file paths from a source directory
 * into the provided array.
 */
function collectFiles(srcDir, destDir, list) {
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(join(srcDir, entry.name), destPath, list);
    } else {
      list.push(destPath);
    }
  }
}
