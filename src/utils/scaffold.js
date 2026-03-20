import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Creates the .codetape/ directory structure with config.json
 * and component-map.json.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @param {{ name: string, language: string, framework: string|null, componentRoots: string[] }} projectInfo
 * @returns {string[]} Array of created file/directory paths
 */
export function scaffold(projectDir, projectInfo) {
  const created = [];
  const baseDir = join(projectDir, '.codetape');
  const tracesDir = join(baseDir, 'traces');
  const archiveDir = join(baseDir, 'archive');

  // 1. Create directories
  mkdirSync(tracesDir, { recursive: true });
  mkdirSync(archiveDir, { recursive: true });
  created.push(baseDir, tracesDir, archiveDir);

  // 2. Write config.json
  const configPath = join(baseDir, 'config.json');
  const config = {
    version: '0.1.0',
    project_name: projectInfo.name,
    language: projectInfo.language,
    framework: projectInfo.framework,
    created_at: new Date().toISOString(),
    sync_targets: {
      readme: {
        path: 'README.md',
        strategy: 'append-managed',
        managed_sections: ['architecture'],
      },
      changelog: {
        path: 'CHANGELOG.md',
        strategy: 'prepend',
      },
      architecture: {
        path: 'docs/ARCHITECTURE.md',
        strategy: 'overwrite',
      },
    },
    tracking: {
      mode: 'manual',
      auto_trace_on_commit: false,
      exclude_patterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '*.lock',
      ],
    },
    component_roots: projectInfo.componentRoots,
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  created.push(configPath);

  // 3. Write component-map.json
  const mapPath = join(baseDir, 'component-map.json');
  const componentMap = {
    updated_at: new Date().toISOString(),
    components: {},
    relationships: [],
  };
  writeFileSync(mapPath, JSON.stringify(componentMap, null, 2) + '\n', 'utf-8');
  created.push(mapPath);

  return created;
}
