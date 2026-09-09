# Integrated Verification Decision Record

## Decision ID
DEC-P3.6-001

## Task / Milestone
P3.6 — Integrated Verification and Handoff

## Date / Session
2026-09-09

## Decision
Make `npm run verify` the authoritative verification gate and require `verify:git-freshness` in both the default gate and captured evidence.

## Context / Problem
Git freshness existed as a standalone check, allowing default verification and evidence capture to pass without proving that the checked-out state matched fetched `origin/main`.

## Rationale
A continuation system must validate source correctness and repository provenance together. Requiring freshness in the shared command list closes the gap without changing application behavior or weakening historical evidence.

## Alternatives Considered
Keeping freshness opt-in was rejected because it leaves the authoritative gate incomplete. Rewriting historical P3.3 evidence was rejected because historical records must remain faithful to their original contract.

## Consequences / Trade-offs
Verification now requires a reachable remote and a clean, fresh Git state. New evidence records the freshness result explicitly; historical evidence remains supported under its original contract.

## Status
CURRENT

## Related Files / Systems
- `scripts/capture-verification.mjs`
- `scripts/ai-state-validation.mjs`
- `scripts/git-freshness.mjs`
- `docs/ai/verification-logs/P3.6.log`
- `docs/ai/handoffs/p3-6-handoff.md`
