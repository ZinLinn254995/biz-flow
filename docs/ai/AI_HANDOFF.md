# BizFlow AI Development Handoff

## PROJECT

BizFlow — offline-first business and personal finance management application.

## CURRENT MILESTONE

P2P18 — COMPLETE

## LAST COMPLETED TASK

P2P18 — Search/Filter/Sort: Added search, filter, sort, and date-range controls to 6 list pages.

## CURRENT TASK

None in progress. The repository is ready for the next task.

## NEXT TASK

P2P19 (Stock Operation Atomicity) + P2P20 (Dead Code Cleanup) — combined for token efficiency.

See `docs/ai/NEXT_TASK_PROMPT.md` for exact implementation instructions.

## OVERALL PROGRESS

| Metric | Value |
|--------|-------|
| Completed milestones | 11 (P2P1 through P2P18) |
| Remaining milestones | 7 (P2P19 through P2P25) |
| Progress | 61% |
| Tests | 507 passing (45 files) |
| TypeScript | PASS |
| Build | PASS |

## IMPLEMENTED FEATURES

- Business CRUD with name, description, currency
- Inventory CRUD with stock tracking, cost/sale prices, reorder threshold, stock status
- Sales CRUD with multi-item line items, payment status, stock deduction/restoration
- Customer CRUD with contact information
- Business Expense CRUD with category and account references
- Personal Income/Expense CRUD with category and account references
- Category CRUD scoped to business/personal
- Account CRUD (cash, bank, wallet, other) with balance
- Budget CRUD with category, limit, period, date range
- Dashboard with real-time financial summaries (business + personal), recent activity, low-stock alerts
- Multi-currency support (per-currency totals, never combined)
- Search, filter, sort, date-range on 6 list pages
- Centralized financial calculations utility
- Inventory stock deduction/restoration with manual rollback

## RECENT CHANGES

| Task | Description | Date |
|------|-------------|------|
| P2P18 | Search/filter/sort on list pages | 2026-09-07 |
| P2P17 | Inventory stock logic in SalesService | 2026-09-07 |
| P2P16 | Centralized financial calculations | 2026-09-07 |
| P2P15 | Dashboard rewritten with real data | 2026-09-07 |
| P2P14 | Account & Budget management UI | earlier |
| P2P7-P2P13 | Full CRUD for all 10 management pages | earlier |

## FILES CHANGED (most recent task)

P2P18 modified 7 page files and created `src/hooks/common/useFilters.ts` (currently unused). No application source files were changed in the AI continuation system upgrade.

## FILES DELETED

None in the most recent task.

## TEST STATUS

| Metric | Value |
|--------|-------|
| Framework | Vitest 4.1.11 |
| Test files | 45 |
| Total tests | 507 |
| Passing | 507 |
| Failing | 0 |
| Verified | 2026-09-07 |

## TYPECHECK STATUS

PASS — `tsc --noEmit -p tsconfig.app.json` exits 0. Verified 2026-09-07.

## BUILD STATUS

PASS — `vite build` exits 0. Verified 2026-09-07.

## KNOWN RISKS

1. **Non-atomic stock operations** (ISSUE-001) — no Dexie transaction, manual rollback only
2. **No concurrency protection** (ISSUE-002) — simultaneous sales could cause negative inventory
3. **Account balances static** (ISSUE-003) — transactions don't update balances
4. **No budget tracking** (ISSUE-004) — limits stored but no actual-vs-limit computation
5. **Sale total not validated** (ISSUE-005) — totalAmount not checked against sum of lineTotal
6. **Not a git repository** — GitHub is not yet the source of truth

## KNOWN ISSUES

See `docs/ai/KNOWN_ISSUES.md` for the full register. Summary:

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| ISSUE-001 | Non-atomic stock operations | High | Open — P2P19 |
| ISSUE-002 | No concurrency protection | High | Open — P2P19 |
| ISSUE-003 | Account balances never update | Medium | Open — P2P23 |
| ISSUE-004 | No budget tracking | Medium | Open — P2P24 |
| ISSUE-005 | Sale total not validated | Medium | Open — P2P22 |
| ISSUE-006 | Orphaned dashboard components | Low | Open — P2P20 |
| ISSUE-007 | Unused useFilters.ts | Low | Open — P2P20 |
| ISSUE-008 | Categories/Accounts missing search | Low | Open — P2P21 |
| ISSUE-009 | Supabase dependency unused | Low | Open |
| ISSUE-010 | No cascade delete | Low | Open |

## ARCHITECTURE CONSTRAINTS

- UI cannot import repositories, services, or Dexie
- Hooks access services via ServiceProvider context
- Services depend on repository interfaces only
- No network calls — fully offline-first
- Money uses integer minor units — never floating-point
- IDs are client-generated UUIDs
- Timestamps auto-managed by repository layer

## LOCKED AREAS

| Area | Status |
|------|--------|
| `src/pages/DashboardPage.tsx` | LOCKED |
| `src/components/layout/AppShell.tsx` | LOCKED |
| `src/components/layout/Sidebar.tsx` | LOCKED |
| `src/components/layout/MobileNavigation.tsx` | LOCKED |
| `src/routes/AppRoutes.tsx` | PROTECTED |
| `src/config/navigationItems.ts` | PROTECTED |
| `src/db/database.ts` | PROTECTED |
| `src/types/` | PROTECTED |
| `src/types/repositories/` | PROTECTED |
| `src/repositories/dexieRepository.ts` | PROTECTED |
| `src/hooks/common/useAsync.ts` | PROTECTED |
| `src/hooks/common/useMutation.ts` | PROTECTED |
| `src/hooks/common/ServiceProvider.tsx` | PROTECTED |
| All completed pages | PROTECTED |
| All existing tests | PROTECTED |

## IMPORTANT DECISIONS

See `docs/ai/DECISIONS.md` for 12 architecture decision records. Key decisions:
- Offline-first with Dexie/IndexedDB (no network dependency)
- Repository pattern with interface segregation
- Constructor dependency injection via ServiceProvider
- Integer minor-unit money (never floating-point)
- Client-generated UUID identifiers
- Multi-currency per-currency totals (never combined)
- No global state library
- Manual rollback for stock operations (P2P19 will add transactions)
- Architecture constraint tests enforce layer boundaries

## NEXT CODING AI INSTRUCTIONS

The next Coding AI should:

1. Read `AGENTS.md` at the repository root
2. Read `docs/ai/AI_STATE.json` for machine-readable state
3. Read `docs/ai/NEXT_TASK_PROMPT.md` for exact task instructions
4. Verify the current state against actual source code
5. Implement P2P19 (Stock Operation Atomicity) + P2P20 (Dead Code Cleanup)
6. Run `npm run typecheck && npm run test && npm run build`
7. Update all handoff documentation under `docs/ai/`
8. Generate the next task (P2P21+P2P22) in `NEXT_TASK_PROMPT.md`
9. Produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`

**Do not ask a human or ChatGPT for the next task.** The repository contains everything needed to continue autonomously.
