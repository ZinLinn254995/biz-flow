# BizFlow — Next Task Prompt Template

> This file is a reusable prompt template. After each milestone, update it with the next task's details. The next AI agent should follow this prompt exactly.

---

## PROJECT

BizFlow — an offline-first business and personal finance management application built with React, TypeScript, Vite, and Dexie/IndexedDB.

## CURRENT STATE

- **Milestone:** P2P18 (COMPLETE)
- **Tests:** 507 passing (45 files)
- **TypeScript:** PASS
- **Build:** PASS
- **Architecture:** 5-layer (UI → Hooks → Services → Repository Interfaces → Dexie Repositories)
- **Database:** Dexie/IndexedDB, `BizFlowDB` v1, 10 tables

## TASK

**P2P19 — Stock Operation Atomicity** (combined with **P2P20 — Dead Code Cleanup**)

## OBJECTIVE

1. Wrap stock deduction + sale persistence in Dexie `db.transaction()` to ensure atomicity
2. Delete orphaned dashboard components and unused useFilters.ts hook

## SCOPE

### P2P19: Stock Atomicity
- **File:** `src/services/sales/SalesService.ts`
  - Import `db` from `@/db`
  - Wrap `createSale` stock deduction + `repository.create` in `db.transaction('rw', [db.sales, db.inventoryItems], async () => {...})`
  - Wrap `deleteSale` stock restoration + `repository.remove` in the same transaction pattern
  - Wrap `updateSale` stock adjustment + `repository.update` in the same transaction pattern
  - Remove manual rollback logic (transactions handle this automatically)
  - Preserve all existing validation logic

### P2P20: Dead Code Cleanup
- **Delete:** `src/components/dashboard/AnalyticsPreview.tsx`
- **Delete:** `src/components/dashboard/BusinessOverview.tsx`
- **Delete:** `src/components/dashboard/InventoryStatus.tsx`
- **Delete:** `src/components/dashboard/PersonalFinanceOverview.tsx`
- **Delete:** `src/components/dashboard/QuickActions.tsx`
- **Delete:** `src/components/dashboard/RecentActivity.tsx`
- **Delete:** `src/components/dashboard/SummaryCard.tsx`
- **Delete:** `src/hooks/common/useFilters.ts`
- **Verify:** No imports reference these files (grep for imports)

## DEPENDENCIES

- None. P2P19 and P2P20 are independent of each other and all other tasks.

## LOCKED AREAS

- `src/pages/DashboardPage.tsx` — do not modify
- `src/components/layout/*` — do not modify
- `src/routes/AppRoutes.tsx` — do not modify
- `src/config/navigationItems.ts` — do not modify
- `src/db/database.ts` — do not modify schema
- `src/types/*` — do not modify
- `src/types/repositories/*` — do not modify
- `src/repositories/dexieRepository.ts` — do not modify
- `src/hooks/common/useAsync.ts` — do not modify
- `src/hooks/common/useMutation.ts` — do not modify
- `src/hooks/common/ServiceProvider.tsx` — do not modify
- All existing pages — do not modify
- All existing test assertions — do not delete

## IMPLEMENTATION RULES

1. Read all files under `docs/ai/` before starting
2. Verify current state against actual source code — trust code over documentation
3. Read `src/services/sales/SalesService.ts` to understand current stock logic
4. Read `src/db/database.ts` and `src/db/index.ts` to understand Dexie setup
5. Implement ONLY the specified task — no unrelated refactoring
6. Preserve all existing functionality
7. Match existing code conventions (naming, imports, error handling)
8. Do not add comments unless explaining a non-obvious WHY
9. Do not introduce new dependencies
10. Do not use Supabase, Firebase, or any network calls
11. Do not use floating-point for money
12. Run verification after implementation

## ACCEPTANCE CRITERIA

1. Stock deduction and sale persistence are atomic (wrapped in Dexie transaction)
2. If any part of the transaction fails, no changes are applied
3. Manual rollback logic is removed (transactions handle this)
4. All existing stock logic tests pass (12 tests in `salesStockLogic.test.ts`)
5. All 507 tests pass
6. TypeScript passes
7. Production build passes
8. 7 orphaned dashboard component files are deleted
9. `useFilters.ts` is deleted
10. No imports reference deleted files
11. No application behavior changes

## TEST REQUIREMENTS

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

All three must pass before the task is considered complete.

## DOCUMENTATION UPDATE REQUIREMENTS

After completing the task, update:

1. `docs/ai/AI_HANDOFF.md` — Update milestone, status, next task
2. `docs/ai/CURRENT_STATE.md` — Update completed tasks, test status, technical debt
3. `docs/ai/CHANGELOG.md` — Append new milestone entry
4. `docs/ai/KNOWN_ISSUES.md` — Mark ISSUE-001, ISSUE-002, ISSUE-006, ISSUE-007 as resolved
5. `docs/ai/NEXT_TASK_PROMPT.md` — Update with the next task (P2P21)

## FINAL HANDOFF REQUIREMENTS

After completing the task, produce a handoff report using the template in `docs/ai/HANDOFF_TEMPLATE.md`. Include:
- What was inspected
- What was changed
- Files created/modified/deleted
- Tests added/changed
- Verification results (TypeScript, tests, build)
- Known limitations
- Recommended next task
