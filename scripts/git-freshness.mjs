#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

export const FRESHNESS_STATES = ['FRESH', 'STALE', 'DIVERGED', 'DIRTY', 'REMOTE_UNAVAILABLE', 'UNKNOWN'];

const runGit = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export function evaluateGitFreshness({ branch, head, originMain, statusPorcelain = '', mergeBase, fetchSucceeded = true, detached = false, expectedBase = 'origin/main' }) {
  if (!fetchSucceeded) return { state: 'REMOTE_UNAVAILABLE', safe: false, reason: 'Fresh remote state could not be fetched.' };
  if (detached || !branch) return { state: 'UNKNOWN', safe: false, reason: 'HEAD is detached or the current branch is unknown.' };
  if (!originMain || !/^[0-9a-f]{40}$/i.test(originMain)) return { state: 'UNKNOWN', safe: false, reason: 'origin/main is unavailable or invalid.' };
  if (statusPorcelain.trim()) return { state: 'DIRTY', safe: false, reason: 'The working tree contains uncommitted changes.' };
  if (!mergeBase) return { state: 'UNKNOWN', safe: false, reason: `Could not establish a merge base with ${expectedBase}.` };
  if (mergeBase !== originMain && mergeBase !== head) return { state: 'DIVERGED', safe: false, reason: `Local history and ${expectedBase} have diverged.` };
  if (head === originMain) return { state: 'FRESH', safe: true, reason: `HEAD matches ${expectedBase}.` };
  if (mergeBase === originMain) return { state: 'FRESH', safe: true, reason: `Feature branch is based on current ${expectedBase}.` };
  return { state: 'STALE', safe: false, reason: `Local HEAD is not based on current ${expectedBase}.` };
}

export function inspectGitFreshness({ cwd = process.cwd(), fetch = true } = {}) {
  let fetchSucceeded = true;
  if (fetch) {
    try { runGit(['fetch', '--prune', 'origin', 'main'], cwd); }
    catch { fetchSucceeded = false; }
  }
  let branch = '';
  let head = '';
  let originMain = '';
  let statusPorcelain = '';
  let mergeBase = '';
  let detached = false;
  try {
    branch = runGit(['branch', '--show-current'], cwd);
    detached = !branch;
    head = runGit(['rev-parse', 'HEAD'], cwd);
    originMain = runGit(['rev-parse', 'origin/main'], cwd);
    statusPorcelain = runGit(['status', '--porcelain=v1'], cwd);
    mergeBase = runGit(['merge-base', 'HEAD', 'origin/main'], cwd);
  } catch {
    return { state: 'UNKNOWN', safe: false, reason: 'Git state could not be inspected reliably.', branch, head, originMain, mergeBase };
  }
  return { ...evaluateGitFreshness({ branch, head, originMain, statusPorcelain, mergeBase, fetchSucceeded, detached }), branch, head, originMain, mergeBase, fetched: fetch };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = inspectGitFreshness({ fetch: !process.argv.includes('--no-fetch') });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.safe ? 0 : 1);
}
