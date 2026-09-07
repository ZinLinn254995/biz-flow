# BizFlow — AI Start Here

> This is the fastest entry point for a new Coding AI. Read this first, then follow the mandatory reading order.

## Project Name

**BizFlow** — an offline-first business and personal finance management application.

## One-Paragraph Description

BizFlow is a React + TypeScript + Vite application that helps small business owners track sales, inventory, customers, business expenses, personal income, personal expenses, budgets, accounts, and categories. All data is stored locally in the browser via Dexie/IndexedDB. No network connection is required. The architecture is a clean 5-layer design (UI → Hooks → Services → Repository Interfaces → Dexie Repositories) with dependency injection and automated architecture constraint tests.

## Current Milestone

**P2P18 — COMPLETE** (verified 2026-09-07)

## Current Test/Build Status

| Metric | Value |
|--------|-------|
| Tests | 507 passing (45 files) |
| TypeScript | PASS |
| Production build | PASS |

## Architecture Summary

```
UI (pages / components)
  ↓
React Hooks (useAsync, useMutation, domain hooks)
  ↓
Application Services (validation, orchestration, calculations)
  ↓
Repository Interfaces (src/types/repositories/)
  ↓
Concrete Repositories (src/repositories/ — Dexie)
  ↓
Dexie / IndexedDB (src/db/database.ts)
```

No network calls. No global state library. DI via ServiceProvider context.

## Mandatory Reading Order

1. `AGENTS.md` — canonical AI instructions (repository root)
2. `docs/ai/AI_HANDOFF.md` — latest handoff state
3. `docs/ai/CURRENT_STATE.md` — detailed current state
4. `docs/ai/AI_STATE.json` — machine-readable state
5. `docs/ai/PROJECT_CONTEXT.md` — project identity and domain model
6. `docs/ai/ARCHITECTURE.md` — technical architecture reference
7. `docs/ai/ROADMAP.md` — roadmap and next tasks
8. `docs/ai/KNOWN_ISSUES.md` — known issues and risks
9. `docs/ai/AI_CONTINUATION_PROTOCOL.md` — how to continue
10. `docs/ai/AI_TASK_SELECTION.md` — how to choose the next task

Then inspect the actual source code before making changes.

## Current Known Risks

1. **Non-atomic stock operations** — no Dexie transaction (ISSUE-001)
2. **No concurrency protection** on stock deduction (ISSUE-002)
3. **Account balances never update** from transactions (ISSUE-003)
4. **No budget tracking** — limits stored but no actual-vs-limit computation (ISSUE-004)
5. **Sale total not validated** against sum of line items (ISSUE-005)
6. **Orphaned dashboard components** — 7 unused files (ISSUE-006)
7. **Unused useFilters.ts** hook (ISSUE-007)

## Locked Files/Areas

- `src/pages/DashboardPage.tsx` — LOCKED
- `src/components/layout/*` — LOCKED
- `src/routes/AppRoutes.tsx` — PROTECTED
- `src/config/navigationItems.ts` — PROTECTED
- `src/db/database.ts` — PROTECTED (schema v1)
- `src/types/*` — PROTECTED
- `src/repositories/dexieRepository.ts` — PROTECTED
- `src/hooks/common/useAsync.ts`, `useMutation.ts`, `ServiceProvider.tsx` — PROTECTED
- All completed pages — PROTECTED
- All existing tests — PROTECTED

See `AGENTS.md` section H for the full locked areas table.

## Next Recommended Task

**P2P19 — Stock Operation Atomicity** (combined with **P2P20 — Dead Code Cleanup**)

Wrap stock deduction + sale persistence in Dexie `db.transaction()` and delete 8 orphaned/unused files.

See `docs/ai/NEXT_TASK_PROMPT.md` for the full implementation prompt.

## How to Perform Continuation

1. Read all files listed in the mandatory reading order above
2. Verify the documented state against actual source code
3. Follow `docs/ai/AI_CONTINUATION_PROTOCOL.md` (9 phases: orient → verify → audit → decide → plan → implement → verify → update handoff → final handoff)
4. Use `docs/ai/AI_TASK_SELECTION.md` to choose the next task if the recommended task is no longer appropriate
5. Implement only the approved scope
6. Run `npm run typecheck`, `npm run test`, `npm run build`
7. Complete the `docs/ai/QUALITY_GATE.md` checklist

## How to Produce Handoff After Implementation

1. Fill out `docs/ai/HANDOFF_TEMPLATE.md`
2. Update `docs/ai/AI_HANDOFF.md` with new milestone and status
3. Update `docs/ai/CURRENT_STATE.md`
4. Update `docs/ai/AI_STATE.json`
5. Append to `docs/ai/CHANGELOG.md`
6. Update `docs/ai/KNOWN_ISSUES.md`
7. Update `docs/ai/NEXT_TASK_PROMPT.md` with the next task
