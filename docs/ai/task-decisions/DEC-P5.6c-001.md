# DEC-P5.6C-001 — Domain Foundation Direction and P5.6c Boundary

## DECISION ID

DEC-P5.6C-001

## TASK / MILESTONE

P5.6c boundary and future domain-foundation direction

## STATUS

CURRENT

## CONTEXT / PROBLEM

P5.6a and P5.6b complete the Purchase domain and workflow, but the remaining stock, cost, and item-model questions are shared domain foundations rather than an open-ended Purchase enhancement. The repository needs an auditable boundary before future implementation begins.

## DECISION

P5.6c remains NOT_STARTED. This record establishes its boundary and does not authorize implementation. The broader Stock + Cost + Item foundation is a separately scoped future milestone.

### 1. Negative stock policy

BizFlow uses a BLOCK policy for negative stock. No authorized stock operation may result in quantity below zero. This applies to sales, purchase reversal/edit/deletion, future adjustments, and other stock-changing operations. Multi-change operations must reject atomically when any required change would go negative; no partial mutation is allowed. This is a domain-integrity rule, not merely UI validation.

### 2. Stock foundation

StockMovement L1 is the future stock-domain foundation. Purchases, sales, adjustments, and reversals will eventually produce historical stock movements that affect the operational `InventoryItem.quantity` cache. Movements provide history, auditability, reconciliation, and source/reason traceability. This is not full event sourcing; corrections should use reversal/compensating movements rather than silently rewriting history. The exact schema and authority rules remain open. StockMovement is not implemented by this record.

### 3. Sale-time cost and provenance

Applicable cost must be preserved as historical sale-time information and must not silently change when later purchase prices change. Known and unknown cost must be distinguishable; unknown cost must not be represented as zero. A future model should identify provenance such as purchase-derived, manually supplied, recipe/theoretical, or another explicit source. No costing algorithm is selected.

### 4. Item/Product boundary

Do not split the current `InventoryItem` into separate Product and Inventory models yet. `InventoryItem` remains the current Item/Product foundation, while the future architecture must be able to express Sellable, Purchasable, and Stockable roles and their combinations. The exact role representation and optionality of price fields remain open. No current item schema changes are authorized.

### 5. Existing-data preservation

Future domain-foundation work must preserve existing purchases, sales, inventory, items, financial records, and backup/restore compatibility. Any schema or domain retrofit requires an explicit migration strategy before implementation. No migration work is authorized here.

## DEFERRED DECISIONS

- Recipe/BOM is a future architecture seam only; no recipe engine, BOM tables, production orders, or ingredient-consumption engine.
- No costing method is approved. FIFO, weighted average, batch costing, recipe theoretical costing, and alternatives remain deferred.

## FUTURE CONSTRAINT ONLY

AI Assistant/tools, AI Credits/Gateway, Owner/Admin Dashboard, Account, authentication, business ownership, cloud synchronization, and multi-device support are out of scope. Future AI must use validated application/domain services rather than raw database manipulation. Future sync must remain compatible with stable identifiers and appropriate historical or append-oriented records. These constraints do not authorize implementation.

## P5.6c SCOPE DECISION

P5.6c is not authorized as an open-ended Purchase enhancement milestone. A narrow Purchase-integrity fix may be considered only if separately authorized and scoped. The broader Stock + Cost + Item foundation is a separate future domain-foundation milestone and must not be hidden inside P5.6c. No new milestone is authorized by this record, and P5.6c remains NOT_STARTED.

## EXPLICIT NON-GOALS

Supplier management; purchase orders; purchase returns/refunds; payment status/payables; tax; discounts; shipping; recipe engine; BOM; production orders; FIFO; weighted-average costing implementation; batch/lot tracking; multi-location inventory; Product/Inventory splitting; SavedItem/Quick Item UI redesign; AI; AI Credits; AI Gateway; Account; authentication; business ownership; cloud sync; multi-device support; Owner/Admin Dashboard; unrelated refactoring.

## OPEN / FUTURE DECISIONS

1. Exact StockMovement schema.
2. StockMovement reconciliation mechanics.
3. Exact movement authority rules.
4. Cost snapshot representation.
5. Cost provenance representation.
6. Costing algorithm.
7. Item role representation.
8. Whether price fields become optional.
9. Opening stock migration.
10. Opening cost migration.
11. Treatment of non-stock purchases such as gas and packaging.
12. Fractional quantities and base units.
13. Unit conversion.
14. Item variants.
15. Discounts.
16. Service charges.
17. Tax.
18. Rounding.
19. SavedItem/Quick Item relationship to the future Item model.

## RATIONALE

Blocking negative stock prevents reversal, edit, and delete operations from silently corrupting inventory integrity. StockMovement L1 provides traceability and reconciliation without prematurely adopting full event sourcing. Sale-time cost preservation keeps historical profitability stable, while explicit unknown-cost and provenance states avoid false precision. Retaining `InventoryItem` avoids premature migration and compatibility cost while preserving a path to role-based behavior. Recipe/BOM and costing are deferred because they deserve dedicated domain capabilities and the business has not selected a costing policy. AI, account, ownership, cloud, and sync work is excluded because it is future direction, not current implementation authorization.

## CONSEQUENCES / TRADE-OFFS

This record changes documentation only. P5.6c remains NOT_STARTED, no application behavior or schema changes are authorized, and the broader Stock + Cost + Item foundation must receive separate milestone authorization. Existing offline-first, layered architecture and data-preservation constraints remain in force.

## ACCEPTANCE / GOVERNANCE

This record is satisfied when the decisions, deferrals, non-goals, and open questions remain auditable in the repository. It does not change application behavior, schema, dependencies, milestone completion, or verification claims. Any implementation requires a separately authorized milestone and its own decision, migration, and verification records.
