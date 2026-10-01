import { describe, expect, it } from 'vitest';
// @ts-ignore The Git freshness checker is an executable Node module outside the app TypeScript project.
import { evaluateGitFreshness } from '../../scripts/git-freshness.mjs';

const sha = (character: string) => character.repeat(40);
const originMain = sha('a');

describe('Git freshness safety checks', () => {
  it('passes when main matches freshly fetched origin/main', () => {
    const result = evaluateGitFreshness({
      branch: 'main',
      head: originMain,
      originMain,
      mergeBase: originMain,
    });
    expect(result).toMatchObject({ state: 'FRESH', safe: true });
  });

  it('passes a clean feature branch based on current origin/main', () => {
    const result = evaluateGitFreshness({
      branch: 'v0/p3.4-git-freshness',
      head: sha('b'),
      originMain,
      mergeBase: originMain,
    });
    expect(result).toMatchObject({ state: 'FRESH', safe: true });
  });

  it('blocks a dirty working tree', () => {
    const result = evaluateGitFreshness({
      branch: 'main', head: originMain, originMain, mergeBase: originMain, statusPorcelain: ' M AGENTS.md',
    });
    expect(result).toMatchObject({ state: 'DIRTY', safe: false });
  });

  it('blocks a branch behind origin/main', () => {
    const result = evaluateGitFreshness({
      branch: 'main', head: sha('b'), originMain, mergeBase: sha('b'),
    });
    expect(result).toMatchObject({ state: 'STALE', safe: false });
  });

  it('blocks diverged histories', () => {
    const result = evaluateGitFreshness({
      branch: 'main', head: sha('b'), originMain, mergeBase: sha('c'),
    });
    expect(result).toMatchObject({ state: 'DIVERGED', safe: false });
  });

  it('blocks failed or unavailable remote verification', () => {
    expect(evaluateGitFreshness({ branch: 'main', head: originMain, originMain, mergeBase: originMain, fetchSucceeded: false })).toMatchObject({ state: 'REMOTE_UNAVAILABLE', safe: false });
    expect(evaluateGitFreshness({ branch: 'main', head: originMain, originMain: '', mergeBase: originMain })).toMatchObject({ state: 'UNKNOWN', safe: false });
  });

  it('recognizes a verified GitHub Actions pull_request merge checkout', () => {
    const mergeCommit = sha('b');
    const result = evaluateGitFreshness({
      branch: '',
      detached: true,
      head: mergeCommit,
      originMain,
      mergeBase: originMain,
      githubActions: true,
      githubEventName: 'pull_request',
      githubSha: mergeCommit,
      githubBaseSha: originMain,
    });
    expect(result).toMatchObject({ state: 'FRESH', safe: true });
  });

  it('blocks detached HEAD without authoritative pull request context', () => {
    expect(evaluateGitFreshness({ branch: '', detached: true, head: originMain, originMain, mergeBase: originMain })).toMatchObject({ state: 'UNKNOWN', safe: false });
    expect(evaluateGitFreshness({ branch: '', detached: true, head: sha('b'), originMain, mergeBase: originMain, githubActions: true, githubEventName: 'pull_request', githubSha: sha('c'), githubBaseSha: originMain })).toMatchObject({ state: 'UNKNOWN', safe: false });
    expect(evaluateGitFreshness({ branch: 'main', head: sha('b'), originMain, mergeBase: '' })).toMatchObject({ state: 'UNKNOWN', safe: false });
  });

  it('rejects a pull request checkout whose base or merge relationship is invalid', () => {
    const mergeCommit = sha('b');
    expect(evaluateGitFreshness({
      branch: '', detached: true, head: mergeCommit, originMain, mergeBase: sha('c'),
      githubActions: true, githubEventName: 'pull_request', githubSha: mergeCommit, githubBaseSha: originMain,
    })).toMatchObject({ state: 'UNKNOWN', safe: false });
  });
});
