import { describe, expect, it } from 'vitest';
// @ts-ignore The validator is an executable Node module outside the app TypeScript project.
import { DEVELOPMENT_STATUSES, handoffArchivePath, isCapturedVerificationEvidence, requiresHandoffArchive, validateContinuity, validateHandoffArchive, validateVerificationEvidence } from '../../scripts/ai-state-validation.mjs';

const state = (overrides: Record<string, unknown> = {}) => ({
  developmentStatus: 'PAUSED_AWAITING_INSTRUCTIONS',
  currentMilestone: { id: 'P2P28' },
  lastCompletedTask: { id: 'P2P28' },
  nextTask: null,
  ...overrides,
});

const documents = (overrides: Record<string, string> = {}) => ({
  'AI_HANDOFF.md': `## CURRENT MILESTONE\nP2P28 — COMPLETE\n## LAST COMPLETED TASK\nP2P28 — Business Cascade Delete.\n## NEXT TASK\nNone — wait for instructions.`,
  'CURRENT_STATE.md': `| Current milestone | P2P28 |\n| Last completed task | P2P28 — Business Cascade Delete |\n## NEXT TASK\nNone — development is paused.`,
  ...overrides,
});

describe('AI state continuity validation', () => {
  it('accepts consistent current and last-completed milestone facts', () => {
    expect(validateContinuity({ state: state(), documents: documents() })).toEqual([]);
  });

  it('accepts historical milestone references outside current-state fields', () => {
    const result = validateContinuity({
      state: state(),
      documents: {
        ...documents(),
        'CURRENT_STATE.md': `${documents()['CURRENT_STATE.md']}\nP2P18 was completed earlier.`,
      },
    });
    expect(result).toEqual([]);
  });

  it('accepts a paused state without an authorized next task', () => {
    expect(validateContinuity({ state: state({ nextTask: null }), documents: documents() })).toEqual([]);
  });

  ([...DEVELOPMENT_STATUSES] as string[]).forEach((developmentStatus) => {
    it(`accepts valid development status ${developmentStatus}`, () => {
      const result = validateContinuity({
        state: state({ developmentStatus }),
        documents: documents(),
      });
      expect(result.some((error: string) => error.includes('invalid value'))).toBe(false);
    });
  });

  it('rejects a current milestone mismatch', () => {
    const result = validateContinuity({
      state: state(),
      documents: documents({ 'AI_HANDOFF.md': '## CURRENT MILESTONE\nP2P25 — COMPLETE' }),
    });
    expect(result.some((error: string) => error.includes('current milestone'))).toBe(true);
  });

  it('rejects a last-completed-task contradiction', () => {
    const result = validateContinuity({
      state: state(),
      documents: documents({ 'AI_HANDOFF.md': '## LAST COMPLETED TASK\nP2P25 — Analytics Page.' }),
    });
    expect(result.some((error: string) => error.includes('last completed task'))).toBe(true);
  });

  it('rejects an invalid development status', () => {
    const result = validateContinuity({ state: state({ developmentStatus: 'PAUSED' }), documents: documents() });
    expect(result.some((error: string) => error.includes('invalid value'))).toBe(true);
  });

  it('rejects a paused state presenting an active next task', () => {
    const result = validateContinuity({
      state: state(),
      documents: documents({ 'AI_HANDOFF.md': '## NEXT TASK\nP3.2 — Archive enforcement' }),
    });
    expect(result.some((error: string) => error.includes('active next task'))).toBe(true);
  });

  it('rejects a stale current milestone in an onboarding document', () => {
    const result = validateContinuity({
      state: state(),
      documents: documents({ 'CURRENT_STATE.md': '| Current milestone | P2P25 |' }),
    });
    expect(result.some((error: string) => error.includes('CURRENT_STATE.md'))).toBe(true);
  });
});

describe('task handoff archive validation', () => {
  const validHandoff = `
## Task ID
P3.2
## Objective
Enforce durable task handoffs.
## What Was Changed
Added archive validation.
## Files Changed
- scripts/verify-ai-state.mjs
## Rationale
Make continuity machine-verifiable.
## Verification
npm run verify:ai passed.
## Known Issues
None.
## Remaining Work
P3.3.
## Next Task
P3.3 — Captured Verification Evidence.
## Restrictions
Do not implement cloud sync.
## Git State
Merged to main after verification.
`;

  it('accepts a complete matching handoff', () => {
    expect(validateHandoffArchive({ taskId: 'P3.2', text: validHandoff })).toEqual([]);
  });

  it('rejects an empty handoff', () => {
    expect(validateHandoffArchive({ taskId: 'P3.2', text: '   ' }).some((error: string) => error.includes('empty'))).toBe(true);
  });

  it('rejects a mismatched task identity', () => {
    const errors = validateHandoffArchive({ taskId: 'P3.2', text: validHandoff.replace('P3.2', 'P3.1') });
    expect(errors.some((error: string) => error.includes('does not match'))).toBe(true);
  });

  it('rejects a missing required section', () => {
    const errors = validateHandoffArchive({ taskId: 'P3.2', text: validHandoff.replace('## Rationale', '') });
    expect(errors.some((error: string) => error.includes('RATIONALE'))).toBe(true);
  });

  it('requires archives for Phase 3 tasks but preserves legacy tasks', () => {
    expect(requiresHandoffArchive('P3.2')).toBe(true);
    expect(requiresHandoffArchive('P2P28')).toBe(false);
    expect(handoffArchivePath('P3.2')).toBe('docs/ai/handoffs/p3-2-handoff.md');
  });
});

describe('captured verification evidence validation', () => {
  const commitSha = 'a'.repeat(40);
  const evidence = (overrides: Record<string, unknown> = {}) => JSON.stringify({
    schemaVersion: 1,
    taskId: 'P3.3',
    commitSha,
    status: 'PASS',
    commands: ['typecheck', 'test', 'build', 'verify:imports', 'verify:locked', 'verify:ai', 'verify'].map((name) => ({
      name,
      command: `npm run ${name}`,
      exitCode: 0,
      stdout: `${name} output`,
      stderr: '',
    })),
    ...overrides,
  });

  it('accepts complete captured evidence with matching task and commit', () => {
    expect(isCapturedVerificationEvidence(evidence())).toBe(true);
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: evidence() })).toEqual([]);
  });

  it('rejects missing, mismatched, or incomplete provenance', () => {
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: '' }).length).toBeGreaterThan(0);
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: evidence({ taskId: 'P3.2' }) }).some((error: string) => error.includes('task ID'))).toBe(true);
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: evidence({ commitSha: 'b'.repeat(40) }) }).some((error: string) => error.includes('commit SHA'))).toBe(true);
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: evidence({ commands: [] }) }).some((error: string) => error.includes('no command records'))).toBe(true);
  });

  it('rejects missing output, exit status, and failed commands', () => {
    const commands = JSON.parse(evidence()).commands;
    commands[0].stdout = '';
    commands[1].exitCode = undefined;
    commands[2].exitCode = 1;
    expect(validateVerificationEvidence({ taskId: 'P3.3', commitSha, text: evidence({ commands, status: 'PASS' }) }).length).toBeGreaterThan(0);
  });

  it('does not treat legacy prose summaries as captured evidence', () => {
    expect(isCapturedVerificationEvidence('Command: npm run test\nResult: PASS')).toBe(false);
  });
});
