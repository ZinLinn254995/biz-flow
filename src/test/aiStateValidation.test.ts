import { describe, expect, it } from 'vitest';
// @ts-ignore The validator is an executable Node module outside the app TypeScript project.
import { DEVELOPMENT_STATUSES, validateContinuity } from '../../scripts/ai-state-validation.mjs';

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
