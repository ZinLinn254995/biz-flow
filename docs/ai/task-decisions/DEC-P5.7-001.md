# DEC-P5.7-001 — Shared Stock and Cost Foundation

## DECISION ID

DEC-P5.7-001

## TASK / MILESTONE

P5.6c — boundary record for the future P5.7 Shared Stock & Cost Foundation

## STATUS

CURRENT

## CONTEXT / PROBLEM

P5.6a and P5.6b are complete, while P5.6c remains not started. The repository needs an auditable boundary for the future shared Stock + Cost + Item foundation without expanding P5.6c or authorizing unrelated future architecture.

## DECISION

The Owner-provided P5.7 specification is recorded as the authorized boundary for a future provider-neutral, offline-first domain foundation. It makes stock changes auditable, blocks negative stock, supports atomic multi-item stock operations, preserves current operational quantities, and preserves historical sale-time cost information without selecting a final costing algorithm. Recording this decision does not start implementation.

P5.6a and P5.6b remain complete. P5.6c remains not started and is not expanded by this decision.

## Authorized scope

### Stock foundation

- Introduce the StockMovement L1 foundation as append-oriented stock history, audit, and reconciliation data.
- Keep `InventoryItem.quantity` as the operational quantity cache for fast reads.
- Route authorized stock-changing operations through a controlled domain/service boundary: validate, check constraints, create movement records, update quantity, and commit atomically.
- Preserve immutable history; corrections use compensating/reversal movements rather than editing or silently deleting history.
- Enforce a block policy for negative stock.
- Ensure multi-item stock operations are all-or-nothing with no partial movement or quantity mutation.
- Provide integration seams for Purchase, Sale, future adjustments, and reversals.

### Cost foundation

- Preserve applicable sale-time cost snapshots so later purchase-price changes do not rewrite historical sales.
- Represent unknown cost distinctly from zero cost.
- Preserve a seam for explicit cost provenance without selecting a costing algorithm.

### Item boundary

- Retain `InventoryItem` as the current Item/Product foundation.
- Preserve conceptual Sellable, Purchasable, and Stockable capabilities without prematurely splitting Product and Inventory entities.
- Do not introduce a schema split unless separately authorized by an implementation decision.

### Safety and compatibility

- Preserve existing purchases, sales, inventory, quantities, financial records, business records, and backup/restore compatibility.
- Design and verify migration/backfill safety before transforming historical data; prevent double-counting existing quantities.
- Remain fully offline-first with no cloud, authentication, provider SDK, or network prerequisite.
- Preserve future compatibility for Account, Cloud Sync, Multi-Device, and AI capabilities without implementing them.
- Future AI must consume validated application/domain services and must not manipulate raw Dexie/IndexedDB state.

## RATIONALE

A shared stock and cost foundation is needed to make inventory history auditable, prevent negative-stock corruption, preserve historical sale economics, and support future Purchase, Sale, Inventory, Recipe/BOM, AI, and synchronization work without prematurely selecting irreversible policies. Keeping the foundation provider-neutral and retaining `InventoryItem` avoids unnecessary migration and compatibility risk.

## Explicit non-goals

The following are not authorized by this decision:

- P5.6 Purchase feature expansion
- supplier management, purchase orders, returns/refunds, payment/payables
- final COGS policy or FIFO, weighted average, batch, standard, moving-average, or recipe costing
- recipe/BOM, manufacturing, production, or ingredient-consumption workflows
- tax, discounts, service charges, shipping, variants, or unrelated UI redesign
- Product/Inventory splitting
- cloud sync, authentication, accounts, multi-device behavior, provider-specific cloud work
- AI Gateway, AI credits, AI implementation, or Owner/Admin dashboard
- unrelated refactoring or dependency upgrades
- P5.8 or later milestones and P4.x cloud/account work

## Deferred architecture decisions

Implementation must separately decide and document, as applicable:

- StockMovement fields, movement types, source/reference model, authority, and reconciliation
- migration/backfill algorithm and opening stock/cost treatment
- cost snapshot and provenance representation
- costing methodology
- Item role representation and price-field optionality
- non-stock purchases, fractional quantities, base units, conversion, and variants
- discounts, tax, service charges, rounding, and Recipe/BOM model

## Acceptance criteria

P5.7 cannot be marked complete unless applicable criteria are demonstrated:

1. Valid stock operations create appropriate StockMovement records.
2. Committed movement and `InventoryItem.quantity` remain consistent.
3. Quantity mutation is controlled by the authorized domain/service boundary.
4. Negative-stock operations are rejected.
5. Multi-item failures produce no partial mutation.
6. Movement history cannot be arbitrarily edited or deleted as correction.
7. Corrections use compensating/reversal semantics.
8. Sale-time cost is historically preserved.
9. Unknown cost is distinct from zero cost.
10. Cost provenance has a valid architectural seam.
11. Existing data remains valid and is not silently discarded.
12. Backup/restore remains compatible.
13. Stock behavior remains offline-capable.
14. No specific cloud, auth, costing, or AI provider is required.
15. Existing Purchase and Sale behavior passes regression coverage.
16. The authoritative verification process passes on the final commit.

## Required migration safety gates

Before completion, implementation must identify all stock mutation paths, Purchase and Sale stock effects, historical movement/backfill requirements, prove that backfill cannot double-count current stock, verify backup/restore compatibility, and verify Purchase/Sale behavior after integration. If any gate cannot be demonstrated, P5.7 must not be marked complete.

## Required verification

At minimum: typecheck, tests, build, import verification, locked-area validation, AI-state validation, Git freshness, and `npm run verify`. Task-specific coverage must include negative stock, atomic multi-item failure, movement creation and quantity consistency, reversal/compensation, cost snapshot, unknown cost, migration/backfill safety, Purchase and Sale regressions, and backup/restore compatibility. Evidence must correspond to the actual final commit.

## CONSEQUENCES / TRADE-OFFS

This record establishes a broad future foundation boundary without changing application behavior, schema, dependencies, milestone completion, or verification claims. It deliberately defers costing, movement schema, migration details, item-role representation, Recipe/BOM, and cloud/AI policy choices. Implementation will require explicit migration and regression evidence, increasing up-front design and verification work but reducing data-corruption and compatibility risk.

## Completion and governance

The required completion sequence is implementation, focused tests, migration safety verification, full verification, documentation/handoff, final commit, merge to `main`, push/Git freshness, and final verification on the final commit. Only then may P5.7 be marked complete. After completion, development returns to `PAUSED_AWAITING_INSTRUCTIONS` unless the Owner authorizes another task.

This record authorizes the defined P5.7 milestone scope only. It does not authorize implementation in this turn, P5.6c, P5.8+, P4.x cloud/account work, AI Gateway, a final costing methodology, Recipe/BOM, provider selection, or unrelated changes.

## Consequences

The repository now has an auditable P5.7 boundary while remaining paused. Any implementation must follow the existing offline-first layered architecture, preserve data and backup compatibility, and create separate implementation, migration, and verification evidence for decisions left open here.

## Source

Recorded from the Owner-provided P5.7 specification on 2026-10-06. The specification is treated as the authoritative milestone boundary; unresolved items remain intentionally deferred rather than inferred.
