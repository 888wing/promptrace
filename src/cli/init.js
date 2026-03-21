import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectProject } from '../utils/detect-project.js';
import { scaffold } from '../utils/scaffold.js';
import { copySkill } from '../utils/copy-skill.js';
import { injectClaudeMd } from '../utils/inject-claude-md.js';

export async function init(args) {
  const projectDir = process.cwd();
  const isNonInteractive = !stdin.isTTY;
  const rl = isNonInteractive ? null : createInterface({ input: stdin, output: stdout });

  async function ask(question, defaultYes = true) {
    if (isNonInteractive) return defaultYes;
    const answer = await rl.question(question);
    return defaultYes ? answer.toLowerCase() !== 'n' : answer.toLowerCase() === 'y';
  }

  try {
    // 1. Check if .codetape/ already exists
    if (existsSync(join(projectDir, '.codetape'))) {
      if (!await ask('.codetape/ already exists. Reconfigure? (y/N) ', false)) {
        console.log('Aborted.');
        return;
      }
    }

    // 2. Detect project
    console.log('\n🔍 Detecting project...\n');
    const projectInfo = detectProject(projectDir);
    console.log(`  Name:       ${projectInfo.name}`);
    console.log(`  Language:   ${projectInfo.language}`);
    console.log(`  Framework:  ${projectInfo.framework || 'none'}`);
    console.log(`  Components: ${projectInfo.componentRoots.join(', ') || 'src/'}`);

    if (!await ask('\nProceed with these settings? (Y/n) ')) {
      console.log('Aborted.');
      return;
    }

    // 3. Scaffold .codetape/
    console.log('\n📁 Creating .codetape/ ...');
    const created = scaffold(projectDir, projectInfo);
    created.forEach(f => console.log(`  ✓ ${f}`));

    // 4. Install skill
    console.log('\n📦 Installing skill...');
    const { skillFiles, commandFiles } = copySkill(projectDir);
    console.log(`  ✓ ${skillFiles.length} skill files → .claude/skills/codetape/`);
    console.log(`  ✓ ${commandFiles.length} commands → .claude/commands/`);

    // 5. CLAUDE.md injection (no prompt — always do it, idempotent)
    console.log('\n📝 Updating CLAUDE.md...');
    const result = injectClaudeMd(projectDir, projectInfo);
    console.log(`  ✓ CLAUDE.md ${result.action}`);

    // 6. .gitignore update (no prompt — always do it, idempotent)
    console.log('\n🔒 Updating .gitignore...');
    const gitignorePath = join(projectDir, '.gitignore');
    const entries = '\n# Codetape\n.codetape/traces/\n.codetape/drift.json\n';
    if (existsSync(gitignorePath)) {
      const content = readFileSync(gitignorePath, 'utf8');
      if (!content.includes('.codetape/traces/')) {
        appendFileSync(gitignorePath, entries);
        console.log('  ✓ Updated .gitignore');
      } else {
        console.log('  ✓ .gitignore already configured');
      }
    } else {
      appendFileSync(gitignorePath, entries);
      console.log('  ✓ Created .gitignore');
    }

    // 7. Success
    console.log('\n✅ Codetape initialized!\n');
    console.log('Next steps:');
    console.log('  1. Make some code changes');
    console.log('  2. Run /trace in Claude Code to record your first trace');
    console.log('  3. Run /trace-sync to update your docs\n');

  } finally {
    if (rl) rl.close();
  }
}
