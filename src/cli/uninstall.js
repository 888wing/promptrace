import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export async function uninstall(args) {
  const projectDir = process.cwd();
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const answer = await rl.question('Remove Codetape skill files? Your .codetape/ data will be preserved. (y/N) ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      return;
    }

    let removedCount = 0;

    // 1. Remove .claude/skills/codetape/ directory
    const skillDir = join(projectDir, '.claude', 'skills', 'codetape');
    if (existsSync(skillDir)) {
      rmSync(skillDir, { recursive: true });
      console.log('  ✓ Removed .claude/skills/codetape/');
      removedCount++;
    } else {
      console.log('  - .claude/skills/codetape/ not found (skipped)');
    }

    // 2. Remove trace-*.md files from .claude/commands/
    const commandsDir = join(projectDir, '.claude', 'commands');
    if (existsSync(commandsDir)) {
      const entries = readdirSync(commandsDir);
      const traceCommands = entries.filter(f => f.startsWith('trace') && f.endsWith('.md'));
      for (const file of traceCommands) {
        rmSync(join(commandsDir, file));
        console.log(`  ✓ Removed .claude/commands/${file}`);
        removedCount++;
      }
      if (traceCommands.length === 0) {
        console.log('  - No trace command files found in .claude/commands/ (skipped)');
      }
    } else {
      console.log('  - .claude/commands/ not found (skipped)');
    }

    // 3. Warn about preserved data
    const codetapeDir = join(projectDir, '.codetape');
    if (existsSync(codetapeDir)) {
      console.log('\n  ⚠ .codetape/ directory preserved (contains your trace data)');
      console.log('    To remove it manually: rm -rf .codetape/');
    }

    console.log(`\n✅ Uninstall complete. Removed ${removedCount} item${removedCount !== 1 ? 's' : ''}.\n`);

  } finally {
    rl.close();
  }
}
