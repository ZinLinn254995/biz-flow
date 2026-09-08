# BizFlow — Current State

**Last verified:** 2026-09-07
**Verified by:** Source code inspection + test execution

## Current Milestone

| Field | Value |
|-------|-------|
| Current milestone | P2P25 |
| Status | COMPLETE |
| Next milestone | P2P26 (Settings Page) |
| Implementation status | All planned tasks through P2P25 are complete |

## Completed Tasks

| Task | Status | Description | Key Files | Tests |
|------|--------|-------------|-----------|-------|
| P2P1 | COMPLETE | Domain types, enums, repository interfaces | `src/types/` | Type compilation only |
| P2P2 | COMPLETE | Dexie/IndexedDB database layer | `src/db/database.ts` | Repository tests |
| P2P3 | COMPLETE | Concrete Dexie repositories + base class + singletons | `src/repositories/` | 6 repository test files |
| P2P5 | COMPLETE | Application service layer with validation + DI | `src/services/` | 8 service test files |
| P2P6 | COMPLETE | React data access layer (hooks, useAsync, useMutation, ServiceProvider) | `src/hooks/` | Hook + constraint tests |
| P2P7–P2P13 | COMPLETE | Page CRUD UI for all 10 management pages | `src/pages/`, `src/components/` | 10 page test files |
| P2P14 | COMPLETE | Account & Budget management UI | `src/pages/AccountsPage.tsx`, `BudgetsPage.tsx` | `accountPage.test.tsx`, `budgetPage.test.tsx` |
| P2P15 | COMPLETE | Dashboard rewritten with real data from hooks | `src/pages/DashboardPage.tsx` | `dashboardPage.test.tsx` (7 tests) |
| P2P16 | COMPLETE | Centralized financial calculations utility | `src/services/calculations/financialCalculations.ts` | `financialCalculations.test.ts` (16 tests) |
| P2P17 | COMPLETE | Inventory stock deduction/restoration in SalesService | `src/services/sales/SalesService.ts` | `salesStockLogic.test.ts` (12 tests) |
| P2P18 | COMPLETE | Search/filter/sort/date-range on list pages | 7 page files | Updated page integration tests |
| P2P19 | COMPLETE | Atomic stock operations via an injected `TransactionRunner` port with a Dexie-backed implementation | `src/services/common/transaction.ts`, `src/repositories/salesTransactionRunner.ts`, `src/services/sales/SalesService.ts`, `src/services/container.ts` | `salesStockLogic.test.ts` (+3 atomicity tests) |
| P2P20 | COMPLETE | Deleted 7 orphaned dashboard components and the unused `useFilters` hook | `src/components/dashboard/*`, `src/hooks/common/useFilters.ts` | `npm run verify:imports` |
| P2P21 | COMPLETE | Search/filter/sort on CategoriesPage and AccountsPage | `src/pages/CategoriesPage.tsx`, `src/pages/AccountsPage.tsx` | `categoryPage.test.tsx`, `accountPage.test.tsx` (+10 tests) |
| P2P22 | COMPLETE | `totalAmount` validated against the sum of line totals, mixed currencies rejected | `src/services/sales/SalesService.ts` | `salesService.test.ts` (+7 tests) |

**Note:** P2P4 is not documented in `architecture.md` and no evidence of it exists in the codebase. It may have been skipped or merged into P2P5.

## In Progress

None. All tasks through P2P22 are complete.

## Not Started

| Task | Description |
|------|-------------|
| P2P23 | Account balance updates on transactions |
| P2P24 | Budget actual-vs-limit tracking |
| P2P25 | Analytics page implementation |
| P2P26 (proposed) | Settings page implementation |
| Future | Cloud sync, data export/import, PWA |

## In-Flight Work

`AI_STATE.json` -> `currentTask` is `null`. No task is partially implemented, and the
working tree matches the last verified state.

## Verification Baseline (2026-09-07, clean `npm ci`)

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run test` | PASS (45 files, 510 tests) |
| `npm run build` | PASS |
| `npm run verify:imports` | PASS |
| `npm run verify:ai` | PASS |

Run all five at once with `npm run verify`.

## Known Bugs

No confirmed bugs. All 510 tests pass, TypeScript passes, production build passes.

## Technical Debt

| ID | Item | Severity | Details |
|----|------|----------|---------|
| TD-01 | Orphaned dashboard components | Low | 7 files in `src/components/dashboard/` no longer imported by `DashboardPage.tsx` |
| TD-02 | Unused `useFilters.ts` hook | Low | Created during P2P18 but pages use inline `useMemo` instead |
| TD-03 | Non-atomic stock operations | Medium | `SalesService` uses manual rollback, not Dexie `db.transaction()` |
| TD-04 | No concurrency protection | Medium | Two simultaneous sales could both pass stock check then both deduct |
| TD-05 | Account balances static | Medium | Transactions with `accountId` don't update `Account.balance` |
| TD-06 | No budget tracking | Medium | Budgets store limits but no actual spending computation |
| TD-07 | Sale total not validated | Low | `totalAmount` not checked against `sum(items.lineTotal)` |
| TD-08 | CategoriesPage/AccountsPage missing search | Low | P2P18 not applied to these two pages |
| TD-09 | Supabase dependency unused | Low | `@supabase/supabase-js` in `package.json` but never imported |
| TD-10 | No cascade delete | Low | Deleting a business doesn't delete children |
| TD-11 | Single 509 kB JS bundle | Low | No code splitting; Vite warns on build |

## Current Test Status

| Metric | Value | Verified |
|--------|-------|----------|
| Test framework | Vitest 4.1.11 | Yes |
| Test files | 45 | Yes |
| Total tests | 507 | Yes |
| Passing | 507 | Yes |
| Failing | 0 | Yes |
| Skipped | 0 | Yes |
| TypeScript | PASS (`tsc --noEmit -p tsconfig.app.json`) | Yes |
| Production build | PASS (`vite build`) | Yes |

### Test breakdown by category

| Category | Files | Approx. tests |
|----------|-------|---------------|
| Repository tests | 6 | ~25 |
| Service tests | 8 | ~85 |
| Hook/page integration tests | 14 | ~280 |
| Architecture constraint tests | 11 | ~100 |
| Core infrastructure tests | 4 | ~17 |

## Current Git State

| Field | Value |
|-------|-------|
| Is git repo | Yes |
| Remote | `https://github.com/ZinLinn254995/biz-flow` |
| Default branch | `main` |
| Source of truth | The GitHub repository |
| CI | `.github/workflows/ai-verify.yml` (typecheck, tests, build, import check, AI state check) |

GitHub is the source of truth. Every completed task must push application code, tests and
updated `docs/ai/*` state together in one commit. See `docs/ai/GITHUB_SYNC.md`.
