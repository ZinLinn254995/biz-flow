# BizFlow — Next Task Instructions for the Next Coding AI

> This file contains the exact instructions for the NEXT Coding AI. Follow this file directly. Do not ask a human or ChatGPT what to do next.

---

## CURRENT MILESTONE

P2P19+P2P20 — COMPLETE

## PREVIOUS COMPLETED TASK

P2P19 — Stock Operation Atomicity (stock movements and sale persistence now commit or roll back together through an injected `TransactionRunner`) combined with P2P20 — Dead Code Cleanup (8 orphaned files deleted).

## NEXT TASK

**P2P21 — Categories & Accounts Search** (combined with **P2P22 — Sale Total Validation**)

## WHY THIS TASK IS NEXT

The high-severity data-integrity issues (ISSUE-001, ISSUE-002) are closed. The highest remaining
items are ISSUE-008 (CategoriesPage and AccountsPage are the only list pages without the P2P18
search/filter/sort controls) and ISSUE-005 (a sale's `totalAmount` is accepted without checking it
against the sum of its line totals). Both are small, independent, and share one verification cycle.

## OBJECTIVE

1. Add search/filter/sort controls to `CategoriesPage` and `AccountsPage`, matching the existing P2P18 patterns used by the other list pages.
2. Validate in `SalesService` that `totalAmount` equals the sum of line totals, in a single currency.

## DEPENDENCIES

None.

## SCOPE — Allowed Files

### P2P21: Categories & Accounts Search
- `src/pages/CategoriesPage.tsx`
- `src/pages/AccountsPage.tsx`
- Shared search/filter components already used by the other list pages (reuse, do not fork)
- `src/test/hooks/categoriesPage.test.tsx`, `src/test/hooks/accountPage.test.tsx` (add assertions only)

### P2P22: Sale Total Validation
- `src/services/sales/SalesService.ts`
- `src/test/services/salesService.test.ts` (add assertions only)

## LOCKED FILES — Do Not Touch

- `src/pages/DashboardPage.tsx`
- `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `MobileNavigation.tsx`
- `src/routes/AppRoutes.tsx`
- `src/config/navigationItems.ts`
- `src/db/database.ts`
- `src/types/*`, `src/types/repositories/*`
- `src/repositories/dexieRepository.ts`
- `src/hooks/common/useAsync.ts`, `useMutation.ts`, `ServiceProvider.tsx`
- All existing test assertions (add only, never delete)

## ARCHITECTURE CONSTRAINTS

- UI cannot import repositories, services, or Dexie
- Services must NOT import `@/db` or Dexie — this is enforced by `src/test/services/serviceConstraints.test.ts`. Anything needing database capability is injected as a port (see `src/services/common/transaction.ts`)
- Services depend on repository interfaces only
- No network calls — fully offline-first
- Money uses integer minor units — never floating-point
- Different currencies are never combined in totals

## IMPLEMENTATION DETAILS

### P2P21
1. Read how `InventoryPage.tsx` or `CustomersPage.tsx` wire search, filter, sort and empty states after P2P18, and reuse the same components and prop shapes.
2. CategoriesPage: search by name, filter by category type, sort by name and created date.
3. AccountsPage: search by name, filter by account type, sort by name and balance.
4. Preserve existing CRUD behaviour and all current test assertions.

### P2P22
1. In `createSale`, after per-item validation, compute the expected total: every `lineTotal` must share one currency, and the sum of `lineTotal.amountMinor` must equal `totalAmount.amountMinor`, with `totalAmount.currency` matching.
2. Throw a `ValidationError` from `@/services/common` with a clear message on mismatch or mixed currency.
3. Apply the same check in `updateSale` when both `items` and `totalAmount` are supplied; when only one is supplied, validate against the persisted sale.
4. Validation must run before any stock movement or transaction is started.

## ACCEPTANCE CRITERIA

1. CategoriesPage and AccountsPage have working search, filter and sort
2. A sale whose `totalAmount` differs from the sum of line totals is rejected
3. A sale mixing currencies across line items is rejected
4. New tests cover both features
5. All existing tests pass (510 at handoff time)
6. TypeScript passes
7. Production build passes
8. No dangling imports, no locked files touched, no network calls added

## REQUIRED TESTS

- Add search/filter/sort assertions to the categories and accounts page tests
- Add total-mismatch and mixed-currency rejection tests to `salesService.test.ts`
- All existing tests, including `serviceConstraints.test.ts` and `salesStockLogic.test.ts`, must pass unchanged

## VERIFICATION COMMANDS

```bash
npm run verify
```

Runs, in order: `npm run typecheck`, `npm run test`, `npm run build`, `npm run verify:imports`
and `npm run verify:ai`. All five must exit 0 before recording the task as `COMPLETE`.
The same five checks run in CI on every push (`.github/workflows/ai-verify.yml`).

## DOCUMENTATION UPDATE REQUIREMENTS

After completing the task, update:

1. `docs/ai/AI_STATE.json` — milestone, `lastCompletedTask`, `nextTask` (P2P23), test count, mark ISSUE-005 and ISSUE-008 resolved, set `lastTaskFilesChanged` and `quality.verificationRun`
2. `docs/ai/CURRENT_STATE.md`
3. `docs/ai/AI_HANDOFF.md`
4. `docs/ai/NEXT_TASK_PROMPT.md` — replace with P2P23 (Account Balance Tracking) instructions
5. `docs/ai/CHANGELOG.md` — append
6. `docs/ai/KNOWN_ISSUES.md` — mark ISSUE-005 and ISSUE-008 resolved
7. `docs/ai/ROADMAP.md`
8. `docs/ai/QUALITY_GATE.md` checklist
9. Commit code and state together and push to `main` — see `docs/ai/GITHUB_SYNC.md`

## IF YOU CANNOT FINISH

Do not mark the task `COMPLETE`. Write a `currentTask` object into `AI_STATE.json` with status
`IN_PROGRESS`, `PARTIAL`, `BLOCKED` or `FAILED`, listing `filesTouched`, `completedWork`,
`remainingWork` and a `recommendation` of `continue` or `revert`.
See the FAILURE RECOVERY section of `docs/ai/AI_CONTINUATION_PROTOCOL.md`.

## NEXT HANDOFF REQUIREMENTS

After completing this task, generate the next task instructions for P2P23 (Account Balance Tracking)
in this file, and produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`.
