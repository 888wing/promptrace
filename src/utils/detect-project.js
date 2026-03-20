import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

/**
 * Detects project language, framework, and component roots
 * by reading manifest files in the given directory.
 *
 * @param {string} projectDir - Absolute path to the project root
 * @returns {{ name: string, language: string, framework: string|null, componentRoots: string[] }}
 */
export function detectProject(projectDir) {
  // 1. Try package.json (JavaScript / TypeScript)
  const pkgPath = join(projectDir, 'package.json');
  if (existsSync(pkgPath)) {
    return detectFromPackageJson(projectDir, pkgPath);
  }

  // 2. Try Cargo.toml (Rust)
  const cargoPath = join(projectDir, 'Cargo.toml');
  if (existsSync(cargoPath)) {
    const name = parseCargoName(cargoPath) || basename(projectDir);
    return {
      name,
      language: 'rust',
      framework: null,
      componentRoots: filterExisting(projectDir, ['src']),
    };
  }

  // 3. Try Python manifests
  const pyprojectPath = join(projectDir, 'pyproject.toml');
  const setupPyPath = join(projectDir, 'setup.py');
  const requirementsPath = join(projectDir, 'requirements.txt');
  if (existsSync(pyprojectPath) || existsSync(setupPyPath) || existsSync(requirementsPath)) {
    return detectPython(projectDir);
  }

  // 4. Try go.mod (Go)
  const goModPath = join(projectDir, 'go.mod');
  if (existsSync(goModPath)) {
    const name = parseGoModName(goModPath) || basename(projectDir);
    return {
      name,
      language: 'go',
      framework: null,
      componentRoots: filterExisting(projectDir, ['pkg', 'internal', 'cmd']),
    };
  }

  // 5. Try Package.swift (Swift)
  const swiftPkgPath = join(projectDir, 'Package.swift');
  if (existsSync(swiftPkgPath)) {
    return {
      name: basename(projectDir),
      language: 'swift',
      framework: null,
      componentRoots: filterExisting(projectDir, ['Sources']),
    };
  }

  // 6. Try project.godot (GDScript)
  const godotPath = join(projectDir, 'project.godot');
  if (existsSync(godotPath)) {
    return {
      name: basename(projectDir),
      language: 'gdscript',
      framework: null,
      componentRoots: filterExisting(projectDir, ['scenes', 'scripts', 'src']),
    };
  }

  // 7. Fallback
  return {
    name: basename(projectDir),
    language: 'unknown',
    framework: null,
    componentRoots: filterExisting(projectDir, ['src']),
  };
}

/**
 * Detects project info from package.json.
 */
function detectFromPackageJson(projectDir, pkgPath) {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    return {
      name: basename(projectDir),
      language: 'javascript',
      framework: null,
      componentRoots: filterExisting(projectDir, ['src']),
    };
  }

  const name = pkg.name || basename(projectDir);
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const hasTs = existsSync(join(projectDir, 'tsconfig.json'));
  const language = hasTs ? 'typescript' : 'javascript';

  const framework = detectJsFramework(allDeps);
  const componentRoots = getJsComponentRoots(framework);

  return {
    name,
    language,
    framework,
    componentRoots: filterExisting(projectDir, componentRoots),
  };
}

/**
 * Identifies the JS/TS framework from dependency keys.
 */
function detectJsFramework(deps) {
  if (!deps) return null;
  if ('next' in deps) return 'nextjs';
  if ('nuxt' in deps) return 'nuxt';
  if ('vue' in deps) return 'vue';
  if ('react' in deps || 'react-dom' in deps) return 'react';
  if ('express' in deps) return 'express';
  if ('fastify' in deps) return 'fastify';
  if ('hono' in deps) return 'hono';
  if ('svelte' in deps || '@sveltejs/kit' in deps) return 'svelte';
  if ('angular' in deps || '@angular/core' in deps) return 'angular';
  return null;
}

/**
 * Returns candidate component root directories for a given JS framework.
 */
function getJsComponentRoots(framework) {
  switch (framework) {
    case 'nextjs':
      return ['app', 'components', 'lib'];
    case 'react':
      return ['src/components', 'src/hooks', 'src/services'];
    case 'vue':
    case 'nuxt':
      return ['src/components', 'src/composables', 'src/stores'];
    case 'angular':
      return ['src/app'];
    case 'svelte':
      return ['src/lib', 'src/routes'];
    case 'express':
    case 'fastify':
    case 'hono':
      return ['src/routes', 'src/controllers', 'src/services', 'src/models'];
    default:
      return ['src'];
  }
}

/**
 * Detects Python project info.
 */
function detectPython(projectDir) {
  const name = basename(projectDir);
  let framework = null;

  // Read pyproject.toml or requirements.txt to detect framework
  const pyprojectPath = join(projectDir, 'pyproject.toml');
  const requirementsPath = join(projectDir, 'requirements.txt');
  let depsText = '';

  if (existsSync(pyprojectPath)) {
    try {
      depsText = readFileSync(pyprojectPath, 'utf-8').toLowerCase();
    } catch { /* ignore */ }
  }
  if (!framework && existsSync(requirementsPath)) {
    try {
      depsText += '\n' + readFileSync(requirementsPath, 'utf-8').toLowerCase();
    } catch { /* ignore */ }
  }

  if (depsText.includes('fastapi')) framework = 'fastapi';
  else if (depsText.includes('django')) framework = 'django';
  else if (depsText.includes('flask')) framework = 'flask';

  const candidateRoots = ['app', 'src', name];
  return {
    name,
    language: 'python',
    framework,
    componentRoots: filterExisting(projectDir, candidateRoots),
  };
}

/**
 * Extracts the package name from Cargo.toml.
 */
function parseCargoName(cargoPath) {
  try {
    const content = readFileSync(cargoPath, 'utf-8');
    const match = content.match(/^\s*name\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extracts the module name from go.mod.
 */
function parseGoModName(goModPath) {
  try {
    const content = readFileSync(goModPath, 'utf-8');
    const match = content.match(/^module\s+(\S+)/m);
    if (match) {
      // Use the last segment of the module path as the name
      const parts = match[1].split('/');
      return parts[parts.length - 1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Filters a list of relative paths to only those that exist as
 * directories under projectDir.
 */
function filterExisting(projectDir, candidates) {
  return candidates.filter((rel) => existsSync(join(projectDir, rel)));
}
