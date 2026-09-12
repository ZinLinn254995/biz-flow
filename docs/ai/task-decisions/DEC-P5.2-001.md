# DEC-P5.2-001 — Generic Item Compatibility Foundation

## DECISION ID
DEC-P5.2-001

## TASK / MILESTONE
P5.2 — Categories and Items — Generalize item/category foundations

## DECISION
Preserve the persisted `InventoryItem` model and introduce `GenericItem` through a one-way compatibility adapter. Keep stock, pricing, and inventory behavior inventory-specific; reuse the existing `categoryId` relationship; do not add a category association table or Dexie migration.

## CONTEXT / PROBLEM
P5.2 needed a reusable item foundation without breaking existing inventory, sales, backup, or offline persistence contracts. The repository already has a stable inventory-specific model and Dexie version 1 schema.

## RATIONALE
An adapter establishes the future-facing domain boundary while leaving persisted records and existing workflows unchanged. This minimizes migration and regression risk and keeps future Saved Items, Quick Items, Favorites, and Quick Add work out of scope.

## CONSEQUENCES / TRADE-OFFS
`GenericItem` is currently a compatibility projection rather than a persisted entity. InventoryItem remains the source model for sales, stock behavior, Dexie, and backup. Future milestones must obtain separate authorization before adding workflows or changing persisted shapes.

## STATUS
CURRENT

## Verification
Final implementation commit: `39c8739ea38066762f29e02417d192efe674a92e`.
`npm run verify` passed after refreshing the local `origin/main` tracking ref; Git freshness was FRESH against `7af0a02389df7b9895c8bc9490c594725f6a7a4c`.

## Migration
No Dexie migration was required or performed.

## Scope exclusions
Saved Items, Quick Items, Favorites, Quick Add, Purchases, accounts, authentication, sync, cloud persistence, networking, and visible future workflows remain unimplemented.

## Final status
P5.2 COMPLETE; project PAUSED awaiting explicit authorization for future work.
