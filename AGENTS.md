# BizFlow AI Development Instructions

## START HERE

Before changing any code:

1. Read `AGENTS.md` (this file)
2. Read `docs/ai/AI_START_HERE.md`
3. Read `docs/ai/AI_HANDOFF.md`
4. Read `docs/ai/CURRENT_STATE.md`
5. Read `docs/ai/PROJECT_CONTEXT.md`
6. Read `docs/ai/ARCHITECTURE.md`
7. Read `docs/ai/ROADMAP.md`
8. Read `docs/ai/KNOWN_ISSUES.md`
9. Read `docs/ai/AI_CONTINUATION_PROTOCOL.md`
10. Read `docs/ai/AI_TASK_SELECTION.md`
11. Read `docs/ai/AI_STATE.json`
12. Inspect the relevant source code
13. Verify documentation against actual implementation
14. Determine the next task
15. Only then modify code

**Do not blindly trust documentation.** The actual source code and test results are the final implementation evidence. If documentation says a feature is complete but the code does not support it, trust the code and report the discrepancy.

---

## A. Project Identity

**BizFlow** is an offline-first business and personal finance management application for small business owners, freelancers, and sole proprietors. It tracks sales, inventory, customers, expenses, personal income/expenses, budgets, accounts, and categories — all stored locally in the browser via IndexedDB. No network connection is required.

## B. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 |
| Language | TypeScript 5.5 |
| Build tool | Vite 5.4 |
| Routing | react-router-dom 7.18 |
| CSS | Tailwind CSS 3.4 |
| Icons | lucide-react 0.446 |
| Database | Dexie (IndexedDB) 4.4.5 |
| Testing | Vitest 4.1, @testing-library/react 16.3, jsdom 30, fake-indexeddb 6.2 |

**Note:** `@supabase/supabase-js` is listed in `package.json` but is NOT imported or used in application code. The app is fully offline-first. Do NOT introduce Supabase, Firebase, or cloud sync unless explicitly requested by the user.

## C. Architecture

```
UI (pages / components)
  ↓ imports hooks only
React Hooks (useAsync, useMutation, domain hooks)
  ↓ calls services via ServiceProvider context
Application Services (validation, orchestration, calculations)
  ↓ calls repository interface methods
Repository Interfaces (src/types/repositories/)
  ↓ implemented by
Concrete Repositories (src/repositories/ — Dexie)
  ↓ operates on
Dexie / IndexedDB (src/db/database.ts)
  ↓ persists to
Device storage (browser IndexedDB)
```

**Key:** Dependencies flow downward only. No layer imports from a layer above it.

## D. Current Milestone

**P2P18 — COMPLETE** (verified 2026-09-07)

All tasks through P2P18 are implemented. 507 tests pass, TypeScript passes, production build passes.

See `docs/ai/AI_STATE.json` for machine-readable state and `docs/ai/CURRENT_STATE.md` for full details.

## E. Where AI Context Documentation Lives

All AI continuation documentation is in `docs/ai/`:

| File | Purpose |
|------|---------|
| `AI_START_HERE.md` | Fastest entry point for a new AI agent |
| `AI_HANDOFF.md` | Complete handoff from the previous AI agent |
| `CURRENT_STATE.md` | Detailed current development state |
| `PROJECT_CONTEXT.md` | Permanent high-level project context |
| `ARCHITECTURE.md` | Technical architecture reference |
| `ROADMAP.md` | Development roadmap with completed/next/future tasks |
| `DECISIONS.md` | Architecture decision records |
| `KNOWN_ISSUES.md` | Issue and technical debt register |
| `AI_CONTINUATION_PROTOCOL.md` | Step-by-step continuation protocol |
| `AI_TASK_SELECTION.md` | Rules for choosing the next task |
| `AI_STATE.json` | Machine-readable project state |
| `NEXT_TASK_PROMPT.md` | Reusable prompt template for next task |
| `HANDOFF_TEMPLATE.md` | Template for final handoff reports |
| `CHANGELOG.md` | Historical changelog |
| `QUALITY_GATE.md` | Mandatory quality checklist |

## F. Mandatory Reading Order

1. `AGENTS.md` (this file) — canonical instructions
2. `docs/ai/AI_START_HERE.md` — quick orientation
3. `docs/ai/AI_HANDOFF.md` — latest handoff state
4. `docs/ai/CURRENT_STATE.md` — detailed current state
5. `docs/ai/AI_STATE.json` — machine-readable state
6. `docs/ai/PROJECT_CONTEXT.md` — project identity and domain model
7. `docs/ai/ARCHITECTURE.md` — technical architecture
8. `docs/ai/ROADMAP.md` — roadmap and next tasks
9. `docs/ai/KNOWN_ISSUES.md` — known issues and risks
10. `docs/ai/AI_CONTINUATION_PROTOCOL.md` — how to continue
11. `docs/ai/AI_TASK_SELECTION.md` — how to choose the next task

Then inspect the actual source code before making changes.

## G. Architectural Constraints

| Rule | Enforced by |
|------|-------------|
| UI cannot import repositories | `*UiConstraints.test.ts` files |
| UI cannot import services directly | `*UiConstraints.test.ts` files |
| UI cannot import Dexie/IndexedDB | `*UiConstraints.test.ts` files |
| Hooks access services via ServiceProvider | `hookConstraints.test.ts` |
| Services depend on repository interfaces | `serviceConstraints.test.ts` |
| No network calls | `offlineVerification.test.ts` |
| Money uses integer minor units | `moneyPrecision.test.ts` |
| IDs are client-generated UUIDs | `timestampBehavior.test.ts` |
| Timestamps auto-managed by repository | `timestampBehavior.test.ts` |
| Offline-first | `offlineVerification.test.ts` |

## H. Locked Areas

| Area | Status | Reason | Modification Rule |
|------|--------|--------|-------------------|
| `src/pages/DashboardPage.tsx` | LOCKED | Stable, recently rewritten, tested | Do not modify unless explicitly required |
| `src/components/layout/AppShell.tsx` | LOCKED | Core layout shell | Do not modify |
| `src/components/layout/Sidebar.tsx` | LOCKED | Navigation structure | Do not modify |
| `src/components/layout/MobileNavigation.tsx` | LOCKED | Mobile navigation | Do not modify |
| `src/routes/AppRoutes.tsx` | PROTECTED | Route registration | Add routes only, never change existing |
| `src/config/navigationItems.ts` | PROTECTED | Navigation config | Add items only, never change existing |
| `src/db/database.ts` schema v1 | PROTECTED | Migration-sensitive | Version migration required for changes |
| `src/types/` domain types | PROTECTED | Contract stability | Change only when required |
| `src/types/repositories/` interfaces | PROTECTED | Architecture boundary | Change carefully |
| `src/repositories/dexieRepository.ts` | PROTECTED | Shared by all repos | Change carefully |
| `src/hooks/common/useAsync.ts` | PROTECTED | Core primitive | Do not modify |
| `src/hooks/common/useMutation.ts` | PROTECTED | Core primitive | Do not modify |
| `src/hooks/common/ServiceProvider.tsx` | PROTECTED | DI context | Do not modify |
| All completed pages | PROTECTED | Working, tested | Add features only, never break |
| All existing tests | PROTECTED | Regression safety | Add tests, do not delete assertions |

If a locked file genuinely must change for a task, the AI must explicitly explain why in the handoff report.

## I. Business Rules

1. Money is always integer minor units + ISO currency code — never floating-point
2. Stock is deducted on sale create, restored on delete, adjusted on update
3. Insufficient stock rejects sale creation
4. Stock status: `out_of_stock` (qty<=0), `low_stock` (qty<=reorderThreshold), `in_stock`
5. IDs are client-generated UUIDs, never database-generated
6. Services validate input; repositories own ID/timestamp generation
7. Different currencies are never combined in totals
8. No network calls — fully offline-first

## J. Money Rules

- `Money { amountMinor: number (integer cents), currency: string (ISO 4217) }`
- Never use floating-point for storage or calculation
- Decimal conversion happens only at the presentation layer (`formatMoney` divides by 100)
- Per-currency totals use `Map<string, number>` — different currencies are never summed
- `validateMoney` checks: `amountMinor` must be a non-negative integer, `currency` must be non-empty

## K. Inventory Rules

- Stock deduction: aggregates quantities per `inventoryItemId`, checks availability, deducts, updates `stockStatus`
- If any item fails (insufficient or not found): rolls back already-applied deductions
- Sale deletion: restores stock, then removes sale
- Sale update with changed items: restores old stock, deducts new stock, updates sale
- **Current limitation:** No Dexie transaction atomicity (manual rollback only). P2P19 addresses this.

## L. Testing Rules

- Run `npm run typecheck` before declaring complete
- Run `npm run test` before declaring complete
- Run `npm run build` before declaring complete
- All three must pass
- Never delete existing test assertions — add only
- Architecture constraint tests must pass — they enforce the layer boundaries
- New behavior requires new tests
- Tests use `fake-indexeddb` for repository/integration tests, `jsdom` for DOM rendering

## M. Git/Change Safety Rules

- Each completed milestone should produce a clear commit
- Example commit messages: `P2P19: atomic stock operations`, `P2P20: dead code cleanup`
- Do not mix unrelated changes into one milestone
- Before implementation: inspect `git status`, understand current branch
- After implementation: verify `git diff`, verify changed files, ensure no accidental modifications
- Do not overwrite uncommitted work
- Do not force-push without explicit authorization

## N. AI Continuation Workflow

```
┌─────────────────────────┐
│     GitHub Repository   │
│      Source of Truth     │
└────────────┬────────────┘
             ↓
      AI Agent reads
      AGENTS.md + docs/ai/*
             ↓
      Inspect actual code
      (trust code over docs)
             ↓
      Implement one task
      (small, verified, incremental)
             ↓
      Run tests / typecheck / build
             ↓
      Update AI handoff docs
             ↓
      Generate final handoff
             ↓
┌─────────────────────────┐
│       Next AI Agent     │
└────────────┬────────────┘
             ↓
      Read AGENTS.md + handoff
             ↓
      Verify repository state
             ↓
      Determine next task
             ↓
           Repeat
```

## O. Handoff Requirements

After completing a task, update:
1. `docs/ai/AI_HANDOFF.md` — milestone, status, next task
2. `docs/ai/CURRENT_STATE.md` — completed tasks, test status, technical debt
3. `docs/ai/AI_STATE.json` — machine-readable state
4. `docs/ai/CHANGELOG.md` — append new milestone entry
5. `docs/ai/KNOWN_ISSUES.md` — mark resolved issues, add new ones
6. `docs/ai/NEXT_TASK_PROMPT.md` — update with next task details
7. Produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`

## P. How to Determine the Next Task

1. Read `docs/ai/AI_TASK_SELECTION.md` for priority rules
2. Read `docs/ai/ROADMAP.md` for the roadmap
3. Read `docs/ai/KNOWN_ISSUES.md` for severity-ranked issues
4. Read `docs/ai/AI_STATE.json` for machine-readable state
5. **Do not blindly follow P2P numbering** — if a critical data integrity issue exists, address it first
6. Explain any deviation from the roadmap

## Q. What NOT to Do

- Do NOT rewrite working architecture
- Do NOT redesign UI unnecessarily
- Do NOT replace Dexie with another database
- Do NOT introduce Supabase, Firebase, or cloud sync without explicit user approval
- Do NOT change routes unnecessarily
- Do NOT change domain contracts unnecessarily
- Do NOT replace existing testing infrastructure
- Do NOT perform broad refactors
- Do NOT delete working code without verification
- Do NOT modify locked files without justification
- Do NOT mix unrelated tasks into one change
- Do NOT change application behavior while performing documentation tasks
- Do NOT add comments unless explaining a non-obvious WHY
- Do NOT use floating-point for money
- Do NOT use emojis in responses

**Prefer small, verified, incremental changes over large rewrites.**
