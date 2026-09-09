# Task-Level Decision Record

## Decision ID
DEC-P3.5-001

## Task / Milestone
P3.5 — Task-Level Decision Records

## Date / Session
2026-09-09

## Decision
Use a lightweight Markdown archive under `docs/ai/task-decisions/`, validated by the existing `verify:ai` entry point, while retaining `docs/ai/DECISIONS.md` as the canonical project decision index and preserving legacy entries.

## Context / Problem
The existing decision document records durable architecture choices but does not identify the task that introduced a decision or provide machine-checkable linkage for future handoffs.

## Rationale
A small required-field contract improves discoverability and prevents malformed new records without forcing historical documentation to be rewritten or introducing a competing workflow.

## Alternatives Considered
A JSON-only registry was rejected because it would duplicate the human-readable decision source. Requiring every historical decision to be migrated was rejected because it would fabricate or distort project history.

## Consequences / Trade-offs
Important Phase 3 task decisions now require a concise record and handoff references can be validated. Legacy architecture decisions remain prose-only and are intentionally exempt from the new contract.

## Status
CURRENT

## Related Files / Systems
- `docs/ai/DECISIONS.md`
- `scripts/task-decision-validation.mjs`
- `scripts/verify-ai-state.mjs`
- `docs/ai/handoffs/p3-5-handoff.md`
