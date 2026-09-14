# DEC-P5.4-001 — Favorites and Quick Add

## DECISION ID
DEC-P5.4-001

## TASK / MILESTONE
P5.4 — Favorites and Quick Add

## DECISION
Persist Saved Item favorites as an optional `favoriteOrder` field. Implement deterministic favorite lookup and a preparation-only Quick Add service; do not create financial records from Quick Add.

## CONTEXT / PROBLEM
P5.3 provides persisted reusable items but no fast reuse primitive. P5.4 must add favorites and preparation while preserving offline-first behavior, existing validation, and inventory-specific stock rules.

## RATIONALE
Using optional metadata on SavedItem avoids a new relation or table. Sorting in the repository/service layer avoids a new Dexie index or migration. Quick Add remains an orchestration boundary so existing financial services remain authoritative.

## CONSEQUENCES / TRADE-OFFS
Favorite ordering is persisted but non-indexed. Existing version-2 records remain compatible with an absent field. Quick Add can prepare reusable input but cannot create sales, expenses, purchases, stock movements, or other financial records.

## STATUS
CURRENT

## Verification
P5.4 implementation typecheck passed and 592 tests across 56 files passed. Final verification is recorded in `docs/ai/verification-logs/P5.4.log`.

## Migration
No Dexie schema migration is required; the database remains version 2 because no table or index changed.

## Scope exclusions
No visible workflow UI, transaction creation, InventoryItem replacement, stock behavior changes, backup-version change, networking, cloud persistence, P5.5 work, or unrelated refactors.
