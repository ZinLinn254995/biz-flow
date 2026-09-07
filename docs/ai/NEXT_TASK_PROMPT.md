# BizFlow — Next Task Instructions for the Next Coding AI

> This file contains the exact instructions for the NEXT Coding AI. Follow this file directly. Do not ask a human or ChatGPT what to do next.

---

## CURRENT MILESTONE

P2P18 — COMPLETE

## PREVIOUS COMPLETED TASK

P2P18 — Search/Filter/Sort: Added search, filter, sort, and date-range controls to 6 list pages.

## NEXT TASK

**P2P19 — Stock Operation Atomicity** (combined with **P2P20 — Dead Code Cleanup**)

## WHY THIS TASK IS NEXT

The non-atomic stock operations (ISSUE-001, ISSUE-002) are the highest-severity known issues. They pose a data integrity risk — if the process crashes between stock deduction and sale persistence, inventory may be inconsistent. The fix is scoped to `SalesService.ts` only — no UI changes, no database schema changes, no route changes. P2P20 (deleting 8 orphaned/unused files) is low-risk and can be done in the same pass for token efficiency.

## OBJECTIVE

1. Wrap stock deduction + sale persistence in Dexie `db.transaction()` to ensure atomicity
2. Delete orphaned dashboard components and unused useFilters.ts hook

## DEPENDENCIES

None. P2P19 and P2P20 are independent of each other and all other tasks.

## SCOPE — Allowed Files

### P2P19: Stock Atomicity
- `src/services/sales/SalesService.ts` — wrap stock operations in Dexie transaction
- `src/test/services/salesStockLogic.test.ts` — update if needed (do not delete existing assertions)

### P2P20: Dead Code Cleanup
- Delete: `src/components/dashboard/AnalyticsPreview.tsx`
- Delete: `src/components/dashboard/BusinessOverview.tsx`
- Delete: `src/components/dashboard/InventoryStatus.tsx`
- Delete: `src/components/dashboard/PersonalFinanceOverview.tsx`
- Delete: `src/components/dashboard/QuickActions.tsx`
- Delete: `src/components/dashboard/RecentActivity.tsx`
- Delete: `src/components/dashboard/SummaryCard.tsx`
- Delete: `src/hooks/common/useFilters.ts`

## LOCKED FILES — Do Not Touch

- `src/pages/DashboardPage.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MobileNavigation.tsx`
- `src/routes/AppRoutes.tsx`
- `src/config/navigationItems.ts`
- `src/db/database.ts`
- `src/types/*`
- `src/types/repositories/*`
- `src/repositories/dexieRepository.ts`
- `src/hooks/common/useAsync.ts`
- `src/hooks/common/useMutation.ts`
- `src/hooks/common/ServiceProvider.tsx`
- All existing pages (unless adding features)
- All existing test assertions (add only, never delete)

## ARCHITECTURE CONSTRAINTS

- UI cannot import repositories, services, or Dexie
- Hooks access services via ServiceProvider context
- Services depend on repository interfaces only
- No network calls — fully offline-first
- Money uses integer minor units — never floating-point
- IDs are client-generated UUIDs

## BUSINESS RULES

- Stock is deducted on sale create, restored on delete, adjusted on update
- Insufficient stock rejects sale creation
- Stock status: out_of_stock (qty<=0), low_stock (qty<=reorderThreshold), in_stock
- Different currencies are never combined in totals

## IMPLEMENTATION DETAILS

### P2P19: Stock Atomicity

1. Import `db` from `@/db` in `SalesService.ts`
2. In `createSale`: wrap `deductStock(items)` + `repository.create(...)` in:
   ```typescript
   await db.transaction('rw', [db.sales, db.inventoryItems], async () => {
     await this.deductStock(input.items);
     return await this.repository.create({ ...input, date, notes });
   });
   ```
3. In `deleteSale`: wrap `restoreStock(sale.items)` + `repository.remove(id)` in the same transaction pattern
4. In `updateSale`: wrap the stock adjustment + `repository.update(id, changes)` in the same transaction pattern
5. Remove manual try/catch rollback logic — Dexie transactions auto-rollback on error
6. Preserve all existing validation logic (do not change validation)
7. The `deductStock` and `restoreStock` private methods can remain as-is — they will be called within the transaction context

### P2P20: Dead Code Cleanup

1. Before deleting, grep for imports of each file to confirm no references exist
2. Delete the 7 dashboard component files in `src/components/dashboard/`
3. Delete `src/hooks/common/useFilters.ts`
4. Check if `src/hooks/common/index.ts` exports from `useFilters` — if so, remove that export
5. Run typecheck to confirm no broken imports

## ACCEPTANCE CRITERIA

1. Stock deduction and sale persistence are atomic (wrapped in Dexie transaction)
2. If any part of the transaction fails, no changes are applied (Dexie auto-rollback)
3. Manual rollback logic is removed (transactions handle this)
4. All existing stock logic tests pass (12 tests in `salesStockLogic.test.ts`)
5. All 507 tests pass
6. TypeScript passes
7. Production build passes
8. 7 orphaned dashboard component files are deleted
9. `useFilters.ts` is deleted
10. No imports reference deleted files (no dangling imports)
11. No application behavior changes

## REQUIRED TESTS

- All existing tests in `src/test/services/salesStockLogic.test.ts` must pass unchanged
- All existing tests in `src/test/services/salesService.test.ts` must pass unchanged
- All existing page integration tests must pass unchanged
- All architecture constraint tests must pass unchanged
- If adding new tests for atomicity, add them to `salesStockLogic.test.ts`

## VERIFICATION COMMANDS

```bash
npm run typecheck
npm run test
npm run build
```

All three must exit with code 0 before the task is considered complete.

## DOCUMENTATION UPDATE REQUIREMENTS

After completing the task, update:

1. `docs/ai/AI_STATE.json` — Update milestone to P2P19+P2P20, update tests count, mark ISSUE-001/002/006/007 as resolved, set next task to P2P21+P2P22
2. `docs/ai/CURRENT_STATE.md` — Add P2P19 and P2P20 to completed tasks, update test status
3. `docs/ai/AI_HANDOFF.md` — Update last completed task, next task, recent changes
4. `docs/ai/NEXT_TASK_PROMPT.md` — Replace with P2P21+P2P22 instructions (Categories & Accounts Search + Sale Total Validation)
5. `docs/ai/CHANGELOG.md` — Append P2P19+P2P20 entry
6. `docs/ai/KNOWN_ISSUES.md` — Mark ISSUE-001, ISSUE-002, ISSUE-006, ISSUE-007 as resolved
7. `docs/ai/ROADMAP.md` — Move P2P19 and P2P20 to completed, update next section
8. Complete the `docs/ai/QUALITY_GATE.md` checklist

## NEXT HANDOFF REQUIREMENTS

After completing this task, generate the next task instructions for P2P21 (Categories & Accounts Search) + P2P22 (Sale Total Validation) in `NEXT_TASK_PROMPT.md`. The next Coding AI should be able to follow that file directly without any external prompt.

Produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`.
