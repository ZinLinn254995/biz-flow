#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const state = JSON.parse(readFileSync(resolve(root, 'docs/ai/AI_STATE.json'), 'utf8'));
const taskId = state.currentTask?.id ?? state.nextTask?.id ?? state.currentMilestone?.id ?? 'verification';
const safeId = String(taskId).replace(/[^A-Za-z0-9._+-]/g, '_');
const logPath = resolve(root, 'docs/ai/verification-logs', `${safeId}.log`);
mkdirSync(dirname(logPath), { recursive: true });
const commands = ['typecheck', 'test', 'build'];
const chunks = [`Verification started ${new Date().toISOString()}`, ''];
let exitCode = 0;
for (const command of commands) {
  chunks.push(`$ npm run ${command}`);
  const result = spawnSync('npm', ['run', command], { cwd: root, encoding: 'utf8' });
  chunks.push(result.stdout ?? '', result.stderr ?? '', `exitCode=${result.status ?? 1}`, '');
  if (result.status !== 0) exitCode = result.status ?? 1;
}
chunks.push(`Verification finished ${new Date().toISOString()}`);
writeFileSync(logPath, chunks.join('\n'));
console.log(`Verification evidence written to ${logPath.replace(`${root}/`, '')}`);
process.exit(exitCode);
