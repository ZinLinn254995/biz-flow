#!/usr/bin/env node
/**
 * BizFlow — dangling relative import detector.
 *
 * Walks every .ts/.tsx file under src/ and verifies that each relative import
 * or re-export resolves to a real file. Catches imports left behind after a
 * file is deleted or renamed (a common dead-code-cleanup regression).
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const EXTENSIONS = ['', '.ts', '.tsx', '.d.ts', '.js', '.jsx', '.json', '.css'];
const problems = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) check(full);
  }
}

function resolves(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  for (const ext of EXTENSIONS) {
    if (existsSync(base + ext) && statSync(base + ext).isFile()) return true;
  }
  for (const ext of ['.ts', '.tsx', '.js']) {
    if (existsSync(join(base, `index${ext}`))) return true;
  }
  return false;
}

function check(file) {
  const source = readFileSync(file, 'utf8');
  const pattern = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const spec = match[1] ?? match[2] ?? match[3];
    if (!spec || !spec.startsWith('.')) continue;
    if (!resolves(file, spec)) {
      problems.push(`${relative(root, file)} -> "${spec}" does not resolve to an existing file`);
    }
  }
}

if (!existsSync(srcDir)) {
  console.error('FAIL src/ directory not found');
  process.exit(1);
}
walk(srcDir);

if (problems.length > 0) {
  for (const p of problems) console.error(`FAIL ${p}`);
  console.error(`\nDangling import check FAILED with ${problems.length} problem(s).`);
  process.exit(1);
}
console.log('Dangling import check PASSED (all relative imports resolve).');
