# BizFlow — Known Issues & Technical Debt Register

## Critical

None.

## High

### ISSUE-001: Non-Atomic Stock Operations
- **ID:** ISSUE-001
- **Title:** Stock deduction and sale persistence are not atomic
- **Severity:** High
- **Description:** `SalesService` deducts inventory stock and then persists the sale as separate operations. If the process crashes between these operations (or during manual rollback), inventory may be left in an inconsistent state. No Dexie `db.transaction()` is used.
- **Impact:** Data integrity risk — inventory quantities may not match actual sales.
- **Possible solution:** Wrap `deductStock` + `repository.create` in `db.transaction('rw', [salesTable, inventoryItemsTable], async () => {...})`.
- **Affected files:** `src/services/sales/SalesService.ts`
- **Dependencies:** None
- **Status:** Open — proposed as P2P19

### ISSUE-002: No Concurrency Protection on Stock
- **ID:** ISSUE-002
- **Title:** Two simultaneous sales could both pass stock check then both deduct
- **Severity:** High
- **Description:** Stock availability is checked then deducted in separate steps. Two concurrent sales for the same item could both pass the availability check, then both deduct, causing negative inventory.
- **Impact:** Negative inventory in edge cases (unlikely in single-user offline app, but possible with rapid double-submission).
- **Possible solution:** Dexie transactions with read-write lock on inventory items.
- **Affected files:** `src/services/sales/SalesService.ts`
- **Dependencies:** ISSUE-001 (same fix)
- **Status:** Open — addressed by P2P19

## Medium

### ISSUE-003: Account Balances Never Update
- **ID:** ISSUE-003
- **Title:** Creating/editing/deleting transactions does not update Account.balance
- **Severity:** Medium
- **Description:** BusinessExpense, PersonalIncome, and PersonalExpense have an optional `accountId` field, but no service logic updates the referenced Account's balance when transactions are created or deleted.
- **Impact:** Account balances are static and do not reflect actual financial activity.
- **Possible solution:** Add balance update logic in service layer (or use Dexie transaction).
- **Affected files:** `BusinessExpenseService.ts`, `PersonalIncomeService.ts`, `PersonalExpenseService.ts`, `AccountService.ts`
- **Dependencies:** None
- **Status:** Open — proposed as P2P23

### ISSUE-004: No Budget Tracking
- **ID:** ISSUE-004
- **Title:** Budgets store limits but no actual spending is computed
- **Severity:** Medium
- **Description:** Budget entities have `limit`, `period`, `startDate`, `endDate`, and `categoryId`, but no service or UI computes actual spending against the limit.
- **Impact:** Budgets are not actionable — users can set limits but cannot see if they're within budget.
- **Possible solution:** Add `computeBudgetUsage(budget, expenses)` to `financialCalculations.ts`, display progress in `BudgetCard`.
- **Affected files:** `BudgetService.ts`, `BudgetsPage.tsx`, `BudgetCard.tsx`, `financialCalculations.ts`
- **Dependencies:** None (but P2P23 improves accuracy)
- **Status:** Open — proposed as P2P24

### ISSUE-005: Sale Total Not Validated Against Line Items
- **ID:** ISSUE-005
- **Title:** `totalAmount` is not checked against `sum(items.lineTotal)`
- **Severity:** Medium
- **Description:** `SalesService.createSale` validates each field independently but does not verify that `totalAmount.amountMinor === sum(items.map(i => i.lineTotal.amountMinor))`.
- **Impact:** A sale could be created with a total that doesn't match its line items.
- **Possible solution:** Add validation in `createSale` and `updateSale`.
- **Affected files:** `src/services/sales/SalesService.ts`
- **Dependencies:** None
- **Status:** Open — proposed as P2P22

## Low

### ISSUE-006: Orphaned Dashboard Components
- **ID:** ISSUE-006
- **Title:** 7 dashboard component files no longer imported
- **Severity:** Low
- **Description:** `src/components/dashboard/` contains `AnalyticsPreview.tsx`, `BusinessOverview.tsx`, `InventoryStatus.tsx`, `PersonalFinanceOverview.tsx`, `QuickActions.tsx`, `RecentActivity.tsx`, `SummaryCard.tsx`. These were replaced when `DashboardPage.tsx` was rewritten in P2P15 but not deleted.
- **Impact:** Dead code confuses developers and AI agents.
- **Possible solution:** Delete the 7 files.
- **Affected files:** `src/components/dashboard/*`
- **Dependencies:** None
- **Status:** Open — proposed as P2P20

### ISSUE-007: Unused useFilters.ts Hook
- **ID:** ISSUE-007
- **Title:** `useFilters.ts` created but never used by any page
- **Severity:** Low
- **Description:** `src/hooks/common/useFilters.ts` exports `useSearchFilter`, `useDateRangeFilter`, `useSort`. Pages implement filtering with inline `useMemo` + `useState` instead.
- **Impact:** Dead code.
- **Possible solution:** Delete the file, or refactor pages to use it.
- **Affected files:** `src/hooks/common/useFilters.ts`
- **Dependencies:** None
- **Status:** Open — proposed as P2P20

### ISSUE-008: CategoriesPage and AccountsPage Missing Search
- **ID:** ISSUE-008
- **Title:** P2P18 search/filter/sort not applied to CategoriesPage and AccountsPage
- **Severity:** Low
- **Description:** All other list pages received search/filter controls in P2P18, but these two pages were skipped.
- **Impact:** Inconsistent UX — these pages lack search that other pages have.
- **Possible solution:** Add search inputs matching the pattern used in other pages.
- **Affected files:** `src/pages/CategoriesPage.tsx`, `src/pages/AccountsPage.tsx`
- **Dependencies:** None
- **Status:** Open — proposed as P2P21

### ISSUE-009: Supabase Dependency Unused
- **ID:** ISSUE-009
- **Title:** `@supabase/supabase-js` in package.json but never imported
- **Severity:** Low
- **Description:** The Supabase JS client is listed as a dependency and credentials exist in `.env`, but no application code imports or uses it.
- **Impact:** Unused dependency increases bundle size slightly.
- **Possible solution:** Remove from package.json if not planning cloud sync, or keep for future use.
- **Affected files:** `package.json`
- **Dependencies:** None
- **Status:** Open — informational

### ISSUE-010: No Cascade Delete
- **ID:** ISSUE-010
- **Title:** Deleting a business does not delete its children
- **Severity:** Low
- **Description:** `BusinessService.deleteBusiness` calls `repository.remove(id)` which deletes only the business record. Inventory, sales, customers, and expenses with that `businessId` remain.
- **Impact:** Orphaned records after business deletion.
- **Possible solution:** Add cascade logic in service layer or UI confirmation.
- **Affected files:** `BusinessService.ts`
- **Dependencies:** None
- **Status:** Open — future

## Future

### ISSUE-011: No Data Export/Import
- **ID:** ISSUE-011
- **Title:** No way to export or import data
- **Severity:** Future
- **Description:** Users cannot export their data for backup or import data from another source.
- **Impact:** Data is locked to the browser. Clearing browser data loses everything.
- **Possible solution:** Add JSON export/import in Settings page.
- **Status:** Open — future

### ISSUE-012: No PWA / Service Worker
- **ID:** ISSUE-012
- **Title:** Application is not installable as a PWA
- **Severity:** Future
- **Description:** No service worker or web manifest exists.
- **Impact:** Cannot be installed as a native app.
- **Possible solution:** Add Vite PWA plugin, manifest, service worker.
- **Status:** Open — future
