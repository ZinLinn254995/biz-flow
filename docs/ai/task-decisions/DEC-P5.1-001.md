# Task-Level Decision Record

## Decision ID
DEC-P5.1-001

## Task / Milestone
P5.1 — Product and Domain Contract Validation

## Decision
Validate the BizFlow Product Blueprint against the current offline-first implementation and preserve explicit boundaries between implemented concepts, partial concepts, and future-only concepts without adding application behavior.

## Context / Problem
P5.1 required a source-backed contract review before future product work. The repository already implements business, inventory, sales, expenses, personal finance, budgets, accounts, offline persistence, and backup, while purchases, bills, reserves, Quick Add, saved items, favorites, Shopping Cart, and expanded planning/reporting remain future scope.

## Rationale
A contract matrix prevents future concepts from being inferred from similarly named current entities. It preserves integer minor-unit money, currency separation, service/repository boundaries, offline persistence, and the rule that source and tests are authoritative over stale explanatory documentation.

## Owner Decisions Applied
- Purchases remain distinct from operating expenses and may eventually affect inventory.
- Bills, budgets, reserves, expenses, actual account balances, and available amounts remain separate concepts.
- Business and personal finance records are not combined into an unscoped transaction model.
- Existing CRUD forms are not treated as Quick Add or saved-item behavior.
- P5.1 does not authorize accounts, authentication, cloud sync, networking, multi-device behavior, schema changes, or dependencies.

## Consequences / Trade-offs
P5.1 is documentation-only and leaves the UI, hooks, services, repository interfaces, Dexie schema, dependencies, and offline behavior unchanged. Future milestones must introduce new concepts through the existing architecture and obtain separate authorization; P5.2 remains unstarted and unauthorized.

## Status
CURRENT

## Verification
The full contract matrix is recorded in this file. Execution evidence is recorded in `docs/ai/verification-logs/P5.1.log` and must reference the finalized commit.

## Contract Matrix

| Blueprint concept | Classification | Current evidence / boundary |
|---|---|---|
| Business, inventory items, categories | IMPLEMENTED | Existing types, services, repositories, routes, and tests; business and personal category scopes remain distinct. |
| Sales | IMPLEMENTED | Sale services include validation and stock movement; payment status is not a payment gateway. |
| Purchases | FUTURE-ONLY | No purchase entity or workflow; must remain separate from BusinessExpense and may affect stock later. |
| Business expenses | IMPLEMENTED | Operating costs exist independently and do not automatically change inventory. |
| Optional stock | PARTIAL | Tracked stock exists; stock-disabled items and transformations remain future work. |
| Personal income and expenses | IMPLEMENTED | Separate types, services, repositories, routes, and tests. |
| Bills | FUTURE-ONLY | Expected obligations must not automatically create expenses. |
| Budgets | IMPLEMENTED | Limits/targets remain distinct from bills, reserves, and account balances. |
| Reserves | FUTURE-ONLY | Allocations toward targets are not expenses or balances. |
| Accounts and balances | IMPLEMENTED | Actual balances remain distinct from reserved and available amounts. |
| Reporting and periods | PARTIAL | Current dashboard/analytics exist; expanded comparisons, drill-down, and planning remain future scope. |
| Quick Add, saved items, favorites | ABSENT | No domain contracts or routes; do not infer them from existing forms. |
| Shopping Cart | FUTURE-ONLY | Future personal quick-entry list, not e-commerce or checkout. |
| Offline persistence and backup | IMPLEMENTED | Dexie v1, repository boundaries, offline tests, and versioned backup are current behavior. |

## Documentation Drift
`PROJECT_CONTEXT.md` and `ARCHITECTURE.md` had historical limitation text for transaction atomicity; the verified current implementation and tests are authoritative, and the relevant documentation was corrected without changing application code.
