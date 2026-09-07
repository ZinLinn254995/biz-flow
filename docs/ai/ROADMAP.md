# BizFlow — Development Roadmap

## Completed Tasks

### P2P1 — Types & Contracts
- **Objective:** Define all domain types, enums, and repository interfaces
- **Scope:** `src/types/`
- **Status:** COMPLETE
- **Tests:** Type compilation only

### P2P2 — Database Layer
- **Objective:** Create Dexie/IndexedDB database with 10 tables and indexes
- **Scope:** `src/db/database.ts`
- **Status:** COMPLETE
- **Tests:** Repository tests verify schema

### P2P3 — Repository Layer
- **Objective:** Implement 10 concrete Dexie repositories + base class + singletons
- **Scope:** `src/repositories/`
- **Status:** COMPLETE
- **Tests:** 6 repository test files
- **Dependencies:** P2P1, P2P2

### P2P5 — Service Layer
- **Objective:** Create 10 application services with validation and DI
- **Scope:** `src/services/`
- **Status:** COMPLETE
- **Tests:** 8 service test files
- **Dependencies:** P2P3

### P2P6 — React Data Access Layer
- **Objective:** Create hooks, useAsync, useMutation, ServiceProvider
- **Scope:** `src/hooks/`
- **Status:** COMPLETE
- **Tests:** Hook + constraint tests
- **Dependencies:** P2P5

### P2P7–P2P13 — Page CRUD UI
- **Objective:** Implement full CRUD for all 10 management pages
- **Scope:** `src/pages/`, `src/components/`
- **Status:** COMPLETE
- **Tests:** 10 page integration test files
- **Dependencies:** P2P6

### P2P14 — Account & Budget UI
- **Objective:** Add Account and Budget management pages
- **Scope:** `src/pages/AccountsPage.tsx`, `BudgetsPage.tsx`, related components
- **Status:** COMPLETE
- **Tests:** `accountPage.test.tsx`, `budgetPage.test.tsx`
- **Dependencies:** P2P7–P2P13

### P2P15 — Dashboard Real Data
- **Objective:** Rewrite Dashboard with real data from hooks and financial calculations
- **Scope:** `src/pages/DashboardPage.tsx`
- **Status:** COMPLETE
- **Tests:** `dashboardPage.test.tsx` (7 tests)
- **Dependencies:** P2P6, P2P16
- **UI impact:** Dashboard fully rewritten
- **Database impact:** None

### P2P16 — Financial Calculations
- **Objective:** Create centralized multi-currency financial calculation utility
- **Scope:** `src/services/calculations/financialCalculations.ts`
- **Status:** COMPLETE
- **Tests:** `financialCalculations.test.ts` (16 tests)
- **Dependencies:** P2P1 (domain types)
- **UI impact:** None (used by Dashboard)
- **Database impact:** None

### P2P17 — Inventory Stock Logic
- **Objective:** Implement stock deduction/restoration in SalesService
- **Scope:** `src/services/sales/SalesService.ts`, `src/services/container.ts`
- **Status:** COMPLETE
- **Tests:** `salesStockLogic.test.ts` (12 tests)
- **Dependencies:** P2P3, P2P5
- **UI impact:** None
- **Database impact:** Inventory quantities updated on sale create/delete/update
- **Risk:** Non-atomic (no Dexie transaction)

### P2P18 — Search/Filter/Sort
- **Objective:** Add search, filter, sort, date-range controls to list pages
- **Scope:** 7 page files (the unused `src/hooks/common/useFilters.ts` was deleted in P2P20)
- **Status:** COMPLETE
- **Tests:** Updated page integration tests
- **Dependencies:** P2P7–P2P13
- **UI impact:** Added filter controls to 6 list pages
- **Database impact:** None
- **Known gap:** CategoriesPage and AccountsPage not updated

### P2P19 — Stock Operation Atomicity
- **Objective:** Wrap stock deduction + sale persistence in one Dexie transaction (implemented as an injected `TransactionRunner` port, since services may not import `@/db`)
- **Scope:** `src/services/sales/SalesService.ts`
- **Status:** COMPLETE (2026-09-07)
- **Dependencies:** None
- **Risk:** Low — no UI changes, only service internals
- **Complexity:** MEDIUM
- **Files affected:** `SalesService.ts`, `salesStockLogic.test.ts`
- **UI impact:** None
- **Database impact:** None (same operations, just wrapped in transaction)
- **Testing:** Existing stock logic tests must still pass; add test for atomicity
- **Can combine with:** P2P20

### P2P20 — Dead Code Cleanup
- **Objective:** Delete orphaned dashboard components and unused useFilters.ts
- **Scope:** `src/components/dashboard/*` (7 files), `src/hooks/common/useFilters.ts`
- **Status:** COMPLETE (2026-09-07)
- **Dependencies:** None
- **Risk:** Low — deleting unused code
- **Complexity:** LOW
- **Files affected:** 8 file deletions
- **UI impact:** None
- **Database impact:** None
- **Testing:** All tests must still pass
- **Can combine with:** P2P19

---

## Completed in the last session

### P2P21 — Categories & Accounts Search
- **Objective:** Add search/filter to CategoriesPage and AccountsPage
- **Scope:** `src/pages/CategoriesPage.tsx`, `src/pages/AccountsPage.tsx`
- **Dependencies:** None
- **Risk:** Low — adding filter controls to two pages
- **Complexity:** LOW
- **Files affected:** 2 page files, possibly their test files
- **UI impact:** New search inputs on two pages
- **Database impact:** None
- **Testing:** Update page tests to verify search functionality
- **Can combine with:** P2P22
- **Status:** COMPLETE (2026-09-07)

### P2P22 — Sale Total Validation
- **Objective:** Validate `totalAmount === sum(items.lineTotal)` in SalesService
- **Scope:** `src/services/sales/SalesService.ts`
- **Dependencies:** None
- **Risk:** Low — adding validation
- **Complexity:** LOW
- **Files affected:** `SalesService.ts`, `salesService.test.ts` or `salesStockLogic.test.ts`
- **UI impact:** None (may reject invalid sales that were previously accepted)
- **Database impact:** None
- **Testing:** Add test for total mismatch rejection
- **Can combine with:** P2P21
- **Status:** COMPLETE (2026-09-07)

---

## Next Tasks

### P2P23 — Account Balance Updates
- **Objective:** Update Account.balance when transactions reference accountId
- **Scope:** Service layer (BusinessExpenseService, PersonalIncomeService, PersonalExpenseService)
- **Dependencies:** None
- **Risk:** Medium — changes service behavior
- **Complexity:** MEDIUM
- **UI impact:** None
- **Database impact:** Account balances change on transaction create/delete

### P2P24 — Budget Tracking
- **Objective:** Compute actual spending vs budget limit per period
- **Scope:** `BudgetService.ts`, `BudgetsPage.tsx`, `BudgetCard.tsx`
- **Dependencies:** P2P23 (for accurate account tracking)
- **Risk:** Medium — new calculations
- **Complexity:** HIGH
- **UI impact:** Budget cards show progress bars

### P2P25 — Analytics Page
- **Objective:** Implement real analytics with charts and insights
- **Scope:** `src/pages/AnalyticsPage.tsx`
- **Dependencies:** All data hooks
- **Risk:** Low — new page, no existing changes
- **Complexity:** HIGH
- **UI impact:** Replaces placeholder

### Future — Settings Page
- **Objective:** Implement settings (currency, data management, export/import)
- **Scope:** `src/pages/SettingsPage.tsx`
- **Dependencies:** None
- **Complexity:** MEDIUM

### Future — Cloud Sync
- **Objective:** Optional Supabase sync layer
- **Dependencies:** All P2P phases complete
- **Complexity:** HIGH
- **Note:** Architecture is designed for this (UUIDs, timestamps, SyncStatus type)
