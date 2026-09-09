import { describe, expect, it } from 'vitest';
// @ts-ignore The validator is an executable Node module outside the app TypeScript project.
import { validateDecisionReferences, validateTaskDecision, validateTaskDecisions } from '../../scripts/task-decision-validation.mjs';

const valid = `## Decision ID\nDEC-P3.5-001\n## Task / Milestone\nP3.5 — Task-Level Decision Records\n## Decision\nUse DEC-prefixed Markdown records as the canonical task-level decision archive.\n## Context / Problem\nFuture sessions need durable reasoning without a second project-management system.\n## Rationale\nExtending DECISIONS.md preserves the existing source while making new records machine-checkable.\n## Alternatives Considered\nA JSON registry was rejected because it would duplicate the human-readable archive.\n## Consequences / Trade-offs\nNew important decisions require a small record, while legacy architecture entries remain unchanged.\n## Status\nCURRENT`;

describe('task decision validation', () => {
  it('accepts a valid linked decision', () => {
    expect(validateTaskDecision({ text: valid, knownTaskIds: ['P3.5'] })).toEqual([]);
  });
  it('accepts multiple unique records and legacy records remain outside the new archive', () => {
    expect(validateTaskDecisions({ records: [{ path: 'a.md', text: valid }, { path: 'b.md', text: valid.replace('001', '002') }], knownTaskIds: ['P3.5'] }).errors).toEqual([]);
  });
  it.each([
    ['DECISION ID', 'DEC-P3.5-001'],
    ['DECISION', 'Use DEC-prefixed Markdown records as the canonical task-level decision archive.'],
    ['CONTEXT / PROBLEM', 'Future sessions need durable reasoning without a second project-management system.'],
    ['RATIONALE', 'Extending DECISIONS.md preserves the existing source while making new records machine-checkable.'],
  ])('rejects missing %s', (_heading, content) => {
    expect(validateTaskDecision({ text: valid.replace(content, ''), knownTaskIds: ['P3.5'] }).length).toBeGreaterThan(0);
  });
  it('rejects invalid status, unknown task, and duplicate IDs', () => {
    expect(validateTaskDecision({ text: valid.replace('CURRENT', 'INVALID'), knownTaskIds: ['P3.5'] }).length).toBeGreaterThan(0);
    expect(validateTaskDecision({ text: valid.replace(/P3\.5/g, 'P9.9'), knownTaskIds: ['P3.5'] }).length).toBeGreaterThan(0);
    expect(validateTaskDecisions({ records: [{ path: 'a.md', text: valid }, { path: 'b.md', text: valid }], knownTaskIds: ['P3.5'] }).errors.some((error: string) => error.includes('Duplicate decision ID'))).toBe(true);
  });
  it('rejects a handoff reference to a missing decision', () => {
    expect(validateDecisionReferences({ text: 'Decision Records: DEC-P3.5-404', knownDecisionIds: new Set(['DEC-P3.5-001']) }).length).toBe(1);
  });
});

