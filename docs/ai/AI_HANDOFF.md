# BizFlow AI Development Handoff

## Handoff Metadata

| Field | Value |
|-------|-------|
| Project | BizFlow |
| Date | 2026-09-07 |
| Current branch | N/A (not a git repo) |
| Latest commit | N/A |
| Current milestone | P2P18 |
| Completed milestone | P2P18 |
| Next milestone | P2P19 (proposed) |
| Implementation status | All tasks through P2P18 complete |

## Executive Summary

BizFlow is a fully offline-first business and personal finance management application built with React, TypeScript, Vite, and Dexie/IndexedDB. All data persists locally in the browser. The application has 10 domain entities, 10 CRUD management pages, a dashboard with real financial summaries, inventory stock deduction logic, and search/filter/sort on list pages. All 507 tests pass, TypeScript passes, and the production build succeeds. The architecture is a clean 5-layer design (UI → Hooks → Services → Repository Interfaces → Dexie Repositories) with dependency injection and automated architecture constraint tests.

## Current Architecture

5-layer offline-first architecture:
- **UI** (13 pages + reusable components) → imports hooks only
- **Hooks** (domain hooks + useAsync/useMutation) → calls services via ServiceProvider context
- **Services** (10 services + calculations + validation) → calls repository interfaces
- **Repository Interfaces** (11 TypeScript interfaces) → implemented by concrete repos
- **Dexie Repositories** (10 repos + base class) → operates on Dexie/IndexedDB

No network calls. No global state library. DI via constructor + React context.

## Current Database

Dexie (IndexedDB), database name `BizFlowDB`, version 1, 10 tables. Client-generated UUID primary keys. Integer minor-unit money. ISO-8601 timestamps. No transactions used (manual rollback for stock operations). No migrations beyond v1.

## Current Domain Model

11 domain entities: Business, InventoryItem, Sale, SaleItem, Customer, BusinessExpense, PersonalIncome, PersonalExpense, Category, Budget, Account. All extend BaseEntity (id, createdAt, updatedAt). Relationships via ID references.

## Completed Work

| Milestone | Description |
|-----------|-------------|
| P2P1 | Types, enums, repository interfaces |
| P2P2 | Dexie/IndexedDB database with 10 tables |
| P2P3 | 10 concrete Dexie repositories + base + singletons |
| P2P5 | 10 application services with validation + DI |
| P2P6 | React data access layer (hooks, useAsync, useMutation, ServiceProvider) |
| P2P7–P2P13 | Full CRUD UI for all 10 management pages |
| P2P14 | Account & Budget management UI |
| P2P15 | Dashboard rewritten with real data + financial calculations |
| P2P16 | Centralized multi-currency financial calculations |
| P2P17 | Inventory stock deduction/restoration in SalesService |
| P2P18 | Search/filter/sort/date-range on 6 list pages |

## Current Work

Nothing unfinished. All tasks through P2P18 are complete.

## Known Issues

See `docs/ai/KNOWN_ISSUES.md` for full register. Key items:
- Non-atomic stock operations (ISSUE-001, ISSUE-002)
- Account balances never update (ISSUE-003)
- No budget tracking (ISSUE-004)
- Sale total not validated (ISSUE-005)
- Orphaned dashboard components (ISSUE-006)
- Unused useFilters.ts (ISSUE-007)
- CategoriesPage/AccountsPage missing search (ISSUE-008)

## Technical Debt

See `docs/ai/KNOWN_ISSUES.md` for full register. Key items:
- 7 orphaned dashboard component files
- 1 unused hook file
- Non-atomic stock operations
- No cascade delete
- Supabase dependency unused

## Locked Areas

| Area | Status | Reason | Modification Rule |
|------|--------|--------|-------------------|
| DashboardPage.tsx | LOCKED | Stable, recently rewritten, tested | Do not modify unless explicitly required |
| AppShell.tsx | LOCKED | Core layout shell | Do not modify |
| Sidebar.tsx | LOCKED | Navigation structure | Do not modify |
| MobileNavigation.tsx | LOCKED | Mobile navigation | Do not modify |
| AppRoutes.tsx | PROTECTED | Route registration | Add routes only, never change existing |
| navigationItems.ts | PROTECTED | Navigation config | Add items only, never change existing |
| database.ts schema v1 | PROTECTED | Migration-sensitive | Version migration required for changes |
| src/types/ domain types | PROTECTED | Contract stability | Change only when required |
| src/types/repositories/ interfaces | PROTECTED | Architecture boundary | Change carefully |
| DexieRepository base | PROTECTED | Shared by all repos | Change carefully |
| useAsync.ts | PROTECTED | Core primitive | Do not modify |
| useMutation.ts | PROTECTED | Core primitive | Do not modify |
| ServiceProvider.tsx | PROTECTED | DI context | Do not modify |
| All completed pages | PROTECTED | Working, tested | Add features only, never break |
| All existing tests | PROTECTED | Regression safety | Add tests, do not delete assertions |

## Important Business Rules

1. Money is always integer minor units + ISO currency code — never floating-point
2. Stock is deducted on sale create, restored on delete, adjusted on update
3. Insufficient stock rejects sale creation
4. Stock status: out_of_stock (qty<=0), low_stock (qty<=reorderThreshold), in_stock
5. IDs are client-generated UUIDs, never database-generated
6. Services validate input; repositories own ID/timestamp generation
7. UI never imports Dexie, repositories, or services directly
8. Different currencies are never combined in totals
9. No network calls — fully offline-first

## Testing Status

| Metric | Value | Verified |
|--------|-------|----------|
| Test framework | Vitest 4.1.11 | Yes |
| Test files | 45 | Yes |
| Total tests | 507 | Yes |
| Passing | 507 | Yes |
| Failing | 0 | Yes |
| TypeScript | PASS | Yes |
| Production build | PASS | Yes |

## Recommended Next Task

**P2P19 — Stock Operation Atomicity**

Wrap `deductStock` + `repository.create` (and `restoreStock` + `repository.remove`, and the update path) in Dexie `db.transaction()` to ensure atomicity. Combine with P2P20 (delete orphaned dashboard components + unused useFilters.ts).

## Why This Task Is Next

The non-atomic stock operations (ISSUE-001, ISSUE-002) are the highest-severity known issues. They pose a data integrity risk. The fix is scoped to `SalesService.ts` only — no UI changes, no database schema changes, no route changes. It can be combined with dead code cleanup (P2P20) for token efficiency.

## Task Scope

| File | Change |
|------|--------|
| `src/services/sales/SalesService.ts` | Wrap stock + persistence in `db.transaction()` |
| `src/test/services/salesStockLogic.test.ts` | Verify atomicity behavior |
| `src/components/dashboard/*` (7 files) | Delete (P2P20) |
| `src/hooks/common/useFilters.ts` | Delete (P2P20) |

## Do Not Touch

- DashboardPage.tsx
- AppShell, Sidebar, MobileNavigation
- AppRoutes.tsx (existing routes)
- database.ts (schema v1)
- All type definitions
- All repository interfaces
- All completed pages (unless adding features)
- All existing test assertions

## Acceptance Criteria

1. Stock deduction and sale persistence are wrapped in a single Dexie transaction
2. If the transaction fails, no stock changes are applied
3. All 507+ existing tests still pass
4. TypeScript passes
5. Production build passes
6. Orphaned dashboard components are deleted
7. Unused useFilters.ts is deleted
8. No application behavior changes

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Next AI Instructions

1. Read all files under `docs/ai/` before starting
2. Verify the current state against the actual source code
3. Read `src/services/sales/SalesService.ts` to understand current stock logic
4. Read `src/db/database.ts` to understand the Dexie database structure
5. Implement P2P19: wrap stock operations in `db.transaction()`
6. Implement P2P20: delete orphaned files
7. Run all verification commands
8. Update `docs/ai/AI_HANDOFF.md` with the new state
9. Update `docs/ai/CHANGELOG.md` with the completed milestone
10. Update `docs/ai/CURRENT_STATE.md` with the new status
11. Produce a final handoff report
