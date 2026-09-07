# BizFlow — Current State

**Last verified:** 2026-09-07
**Verified by:** Source code inspection + test execution

## Current Milestone

| Field | Value |
|-------|-------|
| Current milestone | P2P18 |
| Status | COMPLETE |
| Next milestone | P2P19 (proposed) |
| Implementation status | All planned tasks through P2P18 are complete |

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

**Note:** P2P4 is not documented in `architecture.md` and no evidence of it exists in the codebase. It may have been skipped or merged into P2P5.

## In Progress

None. All tasks through P2P18 are complete.

## Not Started

| Task | Description |
|------|-------------|
| P2P19 (proposed) | Wrap stock operations in Dexie transaction for atomicity |
| P2P20 (proposed) | Delete orphaned dashboard components + unused useFilters.ts |
| P2P21 (proposed) | Add search/filter to CategoriesPage and AccountsPage |
| P2P22 (proposed) | Validate sale totalAmount against sum of line items |
| P2P23 (proposed) | Account balance updates on transactions |
| P2P24 (proposed) | Budget actual-vs-limit tracking |
| P2P25 (proposed) | Analytics page implementation |
| Future | Settings page, cloud sync, data export/import, PWA |

## Known Bugs

No confirmed bugs. All 507 tests pass, TypeScript passes, production build passes.

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
| Is git repo | No |
| Branch | N/A |
| Latest commit | N/A |
| Working tree | N/A |

**Note:** This project is not currently a git repository. GitHub is not yet the source of truth. The AI handoff documentation system is being created to establish this workflow.
