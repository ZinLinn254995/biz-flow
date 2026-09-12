## DECISION ID

DEC-P-BP1-001

## TASK / MILESTONE

P4.1 — Product Blueprint publication and continuity extension

## DECISION

Record the approved BizFlow Product Blueprint and future dependency-aware product roadmap as documentation only, while preserving the completed P4.1 implementation and the paused project state.

## CONTEXT / PROBLEM

The repository needed one durable product-direction document defining generic business and personal-finance vocabulary, planning distinctions, module boundaries, future sequencing, and safe GitHub publication rules. The documentation must not be mistaken for authorization to implement P5.1, accounts, cloud sync, or multi-device behavior.

## RATIONALE

A provider-neutral blueprint gives future coding agents a stable product and architecture reference without coupling the offline-first application to a cloud provider or changing runtime behavior. Recording explicit exclusions and one-authorized-milestone-at-a-time rules reduces scope drift and unsafe continuation.

## CONSEQUENCES / TRADE-OFFS

The milestone is documentation-only: application source, dependencies, persistence behavior, and existing locked areas remain unchanged. P5.1 is the next conceptual milestone but remains unauthorized; future work must be separately scoped, verified, committed on a feature branch, reviewed, merged normally, and proven on remote main.

## STATUS

CURRENT

## Verification

Evidence is recorded in `docs/ai/verification-logs/P-BP1.log`.
