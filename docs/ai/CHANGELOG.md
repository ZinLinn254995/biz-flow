## 2026-09-18 — P5.6a Purchase Domain, Persistence, and Stock Logic In Progress

- Added the purchase aggregate, Dexie v3 `purchases` table, purchase repository wiring, and inventory stock increase/reversal logic.
- Kept the version 1 schema untouched while preserving the existing sales and inventory rules.
- Source implementation and focused tests exist; final governance verification is pending. The invalid historical P5.6b evidence is preserved in `docs/ai/verification-logs/P5.6b.log`.

## 2026-09-17 — P5.5 Recovery Complete

- Began owner-authorized recovery of the missing P5.5 Sale Detail and Receipt milestone.
- Added the read-only detail/receipt implementation and focused tests.
- Full verification passed across 58 test files and 597 tests; branch publication remains separate from merge.
