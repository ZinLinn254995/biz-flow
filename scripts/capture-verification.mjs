#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const state = JSON.parse(readFileSync(resolve(root, 'docs/ai/AI_STATE.json'), 'utf8'));
const taskId = process.env.VERIFICATION_TASK_ID ?? state.currentTask?.id ?? state.nextTask?.id ?? state.currentMilestone?.id ?? 'verification';
const safeId = String(taskId).replace(/[^A-Za-z0-9._+-]/g, '_');
const logPath = resolve(root, 'docs/ai/verification-logs', `${safeId}.log`);
mkdirSync(dirname(logPath), { recursive: true });
const commands = ['typecheck', 'test', 'build', 'verify:imports', 'verify:locked', 'verify:git-freshness', 'verify:ai', 'verify'];
const startedAt = new Date().toISOString();
const commitSha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
const branch = spawnSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).stdout.trim();
const records = [];
for (const command of commands) {
  const result = spawnSync('npm', ['run', command], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, CAPTURING_VERIFICATION: '1' },
  });
  records.push({
    name: command,
    command: `npm run ${command}`,
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  });
}
const evidence = {
  schemaVersion: 1,
  taskId,
  commitSha,
  branch,
  startedAt,
  finishedAt: new Date().toISOString(),
  status: records.every(({ exitCode }) => exitCode === 0) ? 'PASS' : 'FAIL',
  commands: records,
};
writeFileSync(logPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Verification evidence written to ${logPath.replace(`${root}/`, '')}`);
process.exit(evidence.status === 'PASS' ? 0 : 1);
