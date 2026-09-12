# DEC-P5.3-001 — Saved Items Foundation

## DECISION ID
DEC-P5.3-001

## TASK / MILESTONE
P5.3 — Saved Items — Persisted reusable item foundations

## DECISION
Add a persisted SavedItem foundation without adding visible workflows. Reuse the existing service/repository architecture and retain InventoryItem, sales, category, and backup compatibility.

## CONTEXT / PROBLEM
P5.3 requires reusable saved items for future workflows while preserving the offline-first application and existing inventory contracts. A new persisted entity requires explicit schema and backup compatibility evidence.

## RATIONALE
A dedicated SavedItem repository and service keeps reusable-item behavior separate from stock behavior. The Dexie version-2 table is isolated, while optional backup loading preserves compatibility with legacy version-1 backups.

## CONSEQUENCES / TRADE-OFFS
A Dexie migration is required because SavedItem is persisted. Existing tables and indexes remain unchanged. No Quick Add, Favorites, Purchases, or visible Saved Items workflow is included in this milestone.

## STATUS
CURRENT

## Verification
P5.3 verification passed with typecheck, 589 tests across 55 files, and production build. Evidence: `docs/ai/verification-logs/P5.3.log`.

## Migration
Dexie version 2 adds only the `savedItems` table. Persistence tests verify reopening the database preserves SavedItem, InventoryItem, and Category records.

## Scope exclusions
No visible workflow UI, Quick Add, Favorites, Purchases, accounts, authentication, sync, cloud persistence, or networking.

## Final status
P5.3 COMPLETE; project PAUSED awaiting explicit authorization for future work.
