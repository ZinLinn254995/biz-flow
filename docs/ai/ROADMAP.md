## P5.6a — Purchase domain, persistence, and stock logic

COMPLETE. The purchase aggregate, Dexie v3 `purchases` table, backup-compatible repository wiring, purchase service stock adjustment logic, focused purchase persistence/service tests, governance reconciliation, and final verification are complete on local `main` at `b4cf401810404c5ad0dfacd4bb429b3d7134f10d`.

## P5.6b — Purchase workflow integration and UI

COMPLETE. P5.6b adds the purchase list, create, detail, edit, delete, routing, navigation, supplier/notes fields, and focused workflow tests on top of the completed P5.6a domain. P5.6c remains not started.

## P5.7 — Shared Stock and Cost Foundation

COMPLETE on authoritative `main` at merge commit `5de416756106be1af1d88bd1492bdd80884a4678` via PR #9. Includes StockMovement persistence, centralized stock mutation, transaction-boundary repair, sale-time cost snapshot preservation, legacy restore baselines, and regression verification. P5.6c remains not started.

## P5.8 — Expenses

COMPLETE by reconciliation on authoritative `main` at `7701ce1d436df065f066ace8f144b5bcc5e1fc4a`. Existing business and personal expense workflows were verified: domain contracts, Dexie persistence, services, hooks, UI, routing, and tests. No source changes were required; full verification is recorded in `docs/ai/verification-logs/P5.8-existing-implementation.log`.
