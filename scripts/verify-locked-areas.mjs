#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const state = JSON.parse(readFileSync(resolve(root, 'docs/ai/AI_STATE.json'), 'utf8'));
const lockedAreas = state.lockedAreas ?? [];
const changed = new Set();
const run = (args) => { try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }); } catch { return ''; } };
for (const line of run(['diff', '--name-only', '--diff-filter=ACMR']).split('\n')) if (line) changed.add(line.trim());
for (const line of run(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split('\n')) if (line) changed.add(line.trim());
for (const line of run(['show', '--pretty=', '--name-only', 'HEAD']).split('\n')) if (line) changed.add(line.trim());
const matches = (file, area) => area.endsWith('/') ? file.startsWith(area) : file === area;
const errors = [];
for (const file of changed) {
  const area = lockedAreas.find((entry) => matches(file, entry.path));
  if (!area) continue;
  if (area.status === 'LOCKED') errors.push(`${file} is LOCKED (${area.reason ?? 'no reason'})`);
  if (area.status === 'PROTECTED' && !state.currentTask?.lockedFileOverrideReason?.trim()) errors.push(`${file} is PROTECTED and currentTask.lockedFileOverrideReason is missing`);
}
if (errors.length) { for (const error of errors) console.error(`FAIL ${error}`); process.exit(1); }
console.log(`Locked-area guard PASSED (${changed.size} changed path(s) inspected).`);
