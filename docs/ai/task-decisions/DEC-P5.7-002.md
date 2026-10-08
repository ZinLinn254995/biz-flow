# DEC-P5.7-002 — Final Approved Architecture Decisions

## DECISION ID

DEC-P5.7-002

## TASK / MILESTONE

P5.6c — Shared Stock and Cost Foundation boundary

## STATUS

IMPLEMENTED — P5.7 COMPLETE on authoritative main

## CONTEXT / PROBLEM

DEC-P5.7-001 recorded the future P5.7 boundary but intentionally left semantic architecture questions open. The Architect/Owner has now approved the following semantic decisions. Exact TypeScript names, Dexie indexes, repository names, helper names, file placement, and test filenames remain implementation details.

## DECISION

P5.7 architecture was APPROVED and is now IMPLEMENTED. The implementation and repair are merged to authoritative main; development remains PAUSED awaiting the next explicit authorization. The following decisions are accepted and must not be casually reopened during implementation.

### 1. StockMovement — ACCEPTED

- StockMovement is the historical stock-change and audit foundation.
- Rows are immutable and append-oriented.
- Each movement has stable identity and item identity.
- Movement uses a signed integer delta: positive increases stock; negative decreases stock.
- Each movement has classification, source/provenance identity, operation/correlation identity, and creation timestamp.
- A reversal/compensation may reference the original movement.
- Historical rows are never edited or deleted; corrections use compensating/reversal movements.
- Full event sourcing is not part of P5.7.

Conceptual contract: `id`, `itemId`, `delta`, `movementType`, `sourceType`, `sourceId`, `operationId`, `createdAt`, and optional `reversalOfMovementId`.

### 2. Stock Authority — ACCEPTED

`PurchaseService` and `SalesService` remain orchestration owners and call a shared `StockMutationService` boundary. That boundary owns stock invariants, negative-stock validation, quantity mutation, StockMovement creation, and reversal/compensation semantics. Repositories remain persistence-oriented. Arbitrary direct quantity mutation must not bypass the boundary.

### 3. Negative Stock — ACCEPTED

Negative stock is prohibited. All affected item deltas and resulting quantities are preflighted before writes. Any negative result rejects the entire operation with no partial mutation. Successful multi-item operations are atomic. Missing inventory required for reversal is an explicit failure. This applies to Purchase edit/delete/reversal, Sale operations, and future controlled adjustments.

### 4. Transaction Boundary — ACCEPTED

Production stock mutations require a real Dexie transaction. Purchase atomic scope includes Purchase, PurchaseItems, InventoryItem, and StockMovement. Sale atomic scope includes Sale, SaleItems, InventoryItem, and StockMovement. Related writes succeed or fail together. Manual compensation is not production atomicity protection. `directTransactionRunner` is limited to clearly isolated testing/non-production use.

### 5. InventoryService Authority — ACCEPTED

No generic unrestricted public quantity setter is authorized. Quantity changes route through the stock authority. Opening/baseline stock and manual adjustments are explicit controlled operations. InventoryService may manage item metadata and non-quantity fields. No production path may bypass StockMovement and stock invariants.

### 6. Migration — ACCEPTED

Existing `InventoryItem.quantity` is preserved as the stock baseline at the migration boundary. Historical Purchase and Sale records are not replayed. Migration establishes explicit opening/migration provenance, uses a version/batch marker, is idempotent, and preserves existing financial and business records. The exact algorithm is an implementation detail provided these semantics hold.

### 7. Legacy Backup / Restore — ACCEPTED

Restoring a legacy backup preserves `InventoryItem.quantity`, does not replay historical Purchase or Sale records, and establishes a clearly identified opening/migration baseline with restore/migration provenance. The resulting history must not falsely claim reconstructed historical movements. The baseline represents known stock at the restore boundary. New backup formats preserve StockMovement history and required P5.7 cost/migration metadata. Restore remains transactional. Use explicit baseline/opening representation rather than invented historical Purchase/Sale movements.

### 8. Sale-Time Cost — ACCEPTED

SaleItem preserves the applicable cost at sale time in an immutable historical snapshot separate from sale price, with sufficient provenance/reference to explain it. Historical cost is never recalculated from future purchases. FIFO, weighted average, batch, standard, and recipe/theoretical costing remain unselected.

### 9. Unknown Cost — ACCEPTED

The semantic model is `KnownCost | UnknownCost`. Unknown is not zero. Legacy sales whose cost cannot be established are explicitly unknown. Calculations, reports, and AI/read services must distinguish unknown from zero. Exact TypeScript/Dexie representation and a small bounded unknown reason remain implementation details; no oversized taxonomy is required.

### 10. Item/Product Boundary — ACCEPTED

`InventoryItem` remains the combined current Item/Product foundation. P5.7 must not split Product and Inventory. Conceptual roles remain Sellable, Purchasable, and Stockable; persisted role flags are deferred and the item model is not redesigned.

### 11. Quantity Semantics — ACCEPTED

Stock quantities are non-negative integers using existing item-unit semantics. Fractional quantities and unit conversion are deferred. No silent decimal truncation is permitted.

### 12. Non-Stock Purchase — DEFERRED

P5.7 Purchase remains stock-affecting. Non-stock Purchase classification is deferred. Expenses are not redesigned and no hybrid Purchase/Expense model is introduced.

## RATIONALE

These decisions close the semantic architecture questions identified in DEC-P5.7-001 while preserving implementation flexibility. They establish one auditable stock authority, prevent negative-stock corruption, preserve historical cost facts, and protect existing data without selecting future costing, cloud, sync, or AI policies.

## CONSEQUENCES / TRADE-OFFS

P5.7 now has an approved semantic architecture, so implementation details may be selected without reopening these principles. Implementation still requires migration, backup, transaction, and regression evidence. The project remains paused and no source, schema, or runtime behavior changes are authorized by this documentation record.

## EXPLICITLY DEFERRED SCOPE

The following are not P5.7 architecture blockers and are not authorized for implementation: FIFO, weighted average, batch costing, standard costing, Recipe/BOM, production, tax, discounts, service charge, shipping, supplier management, purchase orders, payment/payables, returns/refunds, persisted item roles, fractional quantities, unit conversion, non-stock Purchase classification, cloud provider, authentication, cloud sync, multi-device, AI Gateway, AI credits, and Admin Dashboard.

## ARCHITECTURE VS IMPLEMENTATION DETAILS

The decisions above establish semantics and invariants. Coding AI may select exact property names, Dexie indexes, repository methods, service class names, file placement, and test filenames when implementing, provided the approved semantics are preserved. Those details must not be recorded as architecture blockers or casually reopened.

## IMPLEMENTATION STATUS

- Architecture: APPROVED
- Implementation: COMPLETE
- Implementation authorization: GRANTED
- Development status: PAUSED
- P5.6a/P5.6b: COMPLETE
- P5.6c: NOT_STARTED
- P5.8/P4.x/Cloud Sync/Auth/AI: NOT_STARTED

This record does not itself authorize implementation. The next gate is a final implementation-readiness check and explicit implementation authorization.

## ACCEPTANCE / VERIFICATION EXPECTATION

Implementation must preserve the accepted semantics and pass the repository quality gate, including typecheck, tests, build, import verification, locked-area validation, AI-state validation, Git freshness, `npm run verify`, and task-specific coverage for movement consistency, negative stock, atomicity, reversals, cost snapshots, unknown cost, migration safety, backup/restore, and Purchase/Sale regressions.

## SOURCE

Recorded from the Architect/Owner-approved P5.7 decisions on 2026-10-06. This is a documentation-only architecture record.
