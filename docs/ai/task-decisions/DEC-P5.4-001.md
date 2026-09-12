# DEC-P5.4-001 — Favorites and Quick Add Authorization

## DECISION ID
DEC-P5.4-001

## TASK / MILESTONE
P5.4 — Favorites and Quick Add

## DECISION
P5.4 is explicitly authorized for implementation, but implementation has not started. The approved boundary is persisted SavedItem favorites with deterministic ordering and preparation-only Quick Add. No implicit financial transaction creation is authorized.

## CONTEXT / PROBLEM
P5.3 established the persisted SavedItem foundation but did not add a fast-access or preparation workflow. P5.4 must extend that foundation without changing InventoryItem, sales, stock, category, backup, or offline contracts.

## RATIONALE
An optional non-indexed favorite order on SavedItem preserves the existing entity and avoids a new relation or migration. Preparation-only Quick Add keeps financial validation and persistence owned by existing domain services and prevents accidental transaction creation.

## CONSEQUENCES / TRADE-OFFS
Favorites are limited to Saved Items. Quick Add may prepare validated input but may not create sales, expenses, purchases, stock movements, or other financial records. Dexie remains version 2 unless implementation evidence proves a migration is required; such evidence is a stop condition requiring review. Historical P5.2 and P5.3 records remain unchanged.

## STATUS
CURRENT
