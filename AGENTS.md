# BizFlow AI Development Instructions

## START HERE

**You are not starting a new project.** You are continuing an existing project called BizFlow.

Before changing any code, follow this mandatory startup protocol:

### Mandatory Startup Protocol

| Step | Action |
|------|--------|
| STEP 1 | Read `AGENTS.md` (this file) |
| STEP 2 | Read `docs/ai/AI_START_HERE.md` |
| STEP 3 | Read `docs/ai/AI_STATE.json` |
| STEP 4 | Read `docs/ai/CURRENT_STATE.md` |
| STEP 5 | Read `docs/ai/AI_HANDOFF.md` |
| STEP 6 | Read `docs/ai/NEXT_TASK_PROMPT.md` |
| STEP 7 | Read `docs/ai/ROADMAP.md`, `docs/ai/ARCHITECTURE.md`, `docs/ai/KNOWN_ISSUES.md`, `docs/ai/DECISIONS.md` |
| STEP 8 | Inspect the actual source code relevant to the current task |
| STEP 9 | Run verification before changing anything when practical: `npm run typecheck && npm run test && npm run build` |
| STEP 10 | Determine the exact unfinished task from `NEXT_TASK_PROMPT.md` |

**Do not blindly trust documentation.** The actual source code and test results are the final implementation evidence. If documentation says a feature is complete but the code does not support it, trust the code and report the discrepancy.

**Source of truth hierarchy (highest to lowest):**
1. Actual source code
2. Actual tests
3. Actual package/build configuration
4. `docs/ai/AI_STATE.json`
5. `docs/ai/CURRENT_STATE.md`
6. `docs/ai/AI_HANDOFF.md`
7. `docs/ai/ROADMAP.md`
8. `docs/ai/KNOWN_ISSUES.md`
9. `docs/ai/NEXT_TASK_PROMPT.md`
10. Other explanatory documentation

If documentation conflicts with actual code: inspect the repository and correct the documentation.

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
| `NEXT_TASK_PROMPT.md` | Exact instructions for the NEXT Coding AI |
| `HANDOFF_TEMPLATE.md` | Template for final handoff reports |
| `CHANGELOG.md` | Historical changelog |
| `QUALITY_GATE.md` | Mandatory quality checklist |
| `GITHUB_SYNC.md` | GitHub source-of-truth, commit and synchronization protocol |

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

  If a locked file genuinely must change for a task, the AI must explicitly explain why in the handoff report. `npm run verify:locked` enforces this list against working-tree, index, and current-commit changes; LOCKED files always fail, while PROTECTED files require a non-empty `currentTask.lockedFileOverrideReason`.

  A single task must not modify more than 10 source files, excluding `docs/ai/*`. If more are naturally required, split the work into separately recorded subtasks (for example P2P23a and P2P23b) in `AI_STATE.json` and `ROADMAP.md`. This reduces the blast radius of a bad change.


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
- If you cannot commit: still update repository files locally and report changes are ready to commit

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
      Generate next task instructions
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

  After completing a task, the Coding AI MUST update:
  - `docs/ai/handoffs/<task-id>-handoff.md` with the final report; this archive is append-only and must never overwrite an existing report.

1. `docs/ai/AI_STATE.json` — machine-readable state (milestone, tests, next task, etc.)
2. `docs/ai/CURRENT_STATE.md` — completed tasks, test status, technical debt
3. `docs/ai/AI_HANDOFF.md` — milestone, status, next task, next AI instructions
4. `docs/ai/NEXT_TASK_PROMPT.md` — exact instructions for the NEXT Coding AI
5. `docs/ai/CHANGELOG.md` — append new milestone entry (do not rewrite history)
6. `docs/ai/KNOWN_ISSUES.md` — mark resolved issues, add new ones
7. `docs/ai/ROADMAP.md` — move completed task, update next/future sections
  8. Produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`
  9. Copy the final report to `docs/ai/handoffs/<task-id>-handoff.md`; archives are append-only and must never overwrite an existing report.


The AI must generate the next task automatically. Do NOT leave "TODO: decide next task" or "Ask ChatGPT what to do next." That is forbidden.

## P. How to Determine the Next Task

1. Read `docs/ai/AI_TASK_SELECTION.md` for priority rules
2. Read `docs/ai/ROADMAP.md` for the roadmap
3. Read `docs/ai/KNOWN_ISSUES.md` for severity-ranked issues
4. Read `docs/ai/AI_STATE.json` for machine-readable state
5. **Do not blindly follow P2P numbering** — if a critical data integrity issue exists, address it first
6. Explain any deviation from the roadmap
7. If `NEXT_TASK_PROMPT.md` explicitly defines a valid next task, follow it
8. If it is stale or contradictory, inspect the actual repository and recalculate the correct next task
9. Before starting any task, check `docs/ai/AI_STATE.json` for a `developmentStatus` field. If `developmentStatus` is `PAUSED_AWAITING_INSTRUCTIONS`, the AI must NOT invent, select, or start any task on its own — including tasks from `KNOWN_ISSUES.md`, `ROADMAP.md`, or its own suggestions — even if asked to 'continue'. In this state, the AI must reply in the chat explaining that the project is paused awaiting new instructions from the project owner, and ask what they'd like to work on next. This overrides the normal 'continue' behavior in Section W until `developmentStatus` is changed back to `active` (or removed) by an explicit human instruction referencing a new plan.

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
- Do NOT ask ChatGPT, a human, or a prompt engineer for the next task
- Do NOT leave the next task as a placeholder or TODO

**Prefer small, verified, incremental changes over large rewrites.**

## R. Failure Recovery Procedure

If implementation fails:

1. **Do NOT update the project as COMPLETE.**
2. Record the failure in `docs/ai/AI_HANDOFF.md` and `docs/ai/CHANGELOG.md`.
3. Diagnose the root cause — read the error, check assumptions, try a focused fix.
4. Fix the implementation.
5. Re-run verification: `npm run typecheck && npm run test && npm run build`.
6. Only then mark the task complete.

If the task cannot safely be completed:
- Mark it **BLOCKED** in `AI_STATE.json` and `AI_HANDOFF.md`.
- Document why it is blocked.
- Do NOT invent a fake completion.
- Generate a BLOCKED handoff explaining what the next Coding AI must inspect.

## S. Completion Criteria

A task is COMPLETE only when ALL of the following are true:
1. `npm run typecheck` exits 0
2. `npm run test` exits 0 with all tests passing
3. `npm run build` exits 0
4. No unintended source changes (verify with `git diff` or file comparison)
5. No dangling imports (no imports reference deleted or renamed files)
6. No broken routes (all routes in `AppRoutes.tsx` resolve)
7. No architecture constraint violations (all `*UiConstraints.test.ts` pass)
8. All handoff documentation updated
9. Next task defined in `NEXT_TASK_PROMPT.md` (not a placeholder)
  10. `docs/ai/QUALITY_GATE.md` checklist completed
  11. `npm run verify` has run end to end and `quality.verificationRun.results` references the captured stdout/stderr log in `docs/ai/verification-logs/<task-id>.log`, rather than self-reported PASS/FAIL text.


If any check fails, the task is NOT complete. Fix the issue before declaring completion.

## T. Task Status Vocabulary (machine-readable)

Every task recorded in `docs/ai/AI_STATE.json` uses exactly one of these statuses:

| Status | Meaning | Allowed to hand off? |
|--------|---------|----------------------|
| `PLANNED` | Defined but not started | Yes |
| `IN_PROGRESS` | Actively being implemented, working tree may be inconsistent | Yes, but must be recorded in `AI_STATE.json.currentTask` with `filesTouched` |
| `BLOCKED` | Cannot proceed; reason recorded | Yes, with the blocker documented |
| `PARTIAL` | Some acceptance criteria met, others not; verification does not fully pass | Yes, with remaining work listed |
| `COMPLETE` | All acceptance criteria met AND `npm run verify` passed | Yes |
| `FAILED` | Attempted and abandoned; work reverted or left broken with explanation | Yes, with recovery instructions |

**A task may only be marked `COMPLETE` when `npm run verify` actually exited 0 and the run is recorded in `AI_STATE.json` -> `quality.verificationRun`.** Marking unverified work COMPLETE is the single most damaging thing a Coding AI can do to this project.

## U. One-Command Verification

```bash
npm run verify
```

Runs, in order:

| Step | Command | Checks |
|------|---------|--------|
| 1 | `npm run typecheck` | TypeScript |
| 2 | `npm run test` | Vitest suite |
| 3 | `npm run build` | Production build |
| 4 | `npm run verify:imports` | Every relative import in `src/` resolves (catches dangling imports after deletions) |
  | 5 | `npm run verify:locked` | Changed LOCKED/PROTECTED areas are rejected unless explicitly overridden |
  | 6 | `npm run verify:ai` | `AI_STATE.json` is valid, complete, uses legal statuses, confidence flags, verification-log evidence, references only existing files, and agrees with `NEXT_TASK_PROMPT.md`, `AI_HANDOFF.md` and `CURRENT_STATE.md` |

  Before declaring completion, run `node scripts/capture-verification.mjs` to capture real typecheck/test/build stdout and stderr into `docs/ai/verification-logs/<task-id>.log`, then record that path in `quality.verificationRun.results`.


The same five steps run in CI on every push via `.github/workflows/ai-verify.yml`.
Use **Node 22** — the architecture constraint tests call `node:fs` `globSync`, which does not exist on Node 20.
The workflow is verification only — it never modifies source and never generates code.

## V. GitHub Source of Truth

The repository `https://github.com/ZinLinn254995/biz-flow` (branch `main`) is the
only source of truth for project state. Chat transcripts are not.

A handoff is complete only when code, tests, and updated `docs/ai/*` state are
pushed together in one commit. Read `docs/ai/GITHUB_SYNC.md` before committing.

If your environment cannot push to GitHub, say so explicitly and list every
changed file so the human can commit. Never claim a push happened when it did not.

Whenever a milestone status changes to `COMPLETE` in `docs/ai/AI_STATE.json`,
create the annotated git tag `milestone/<milestone-id>` on the completion commit
and push that tag to GitHub. The tag must point to the same commit that updates
the milestone state; never move or overwrite an existing milestone tag.

## W. Same-Chat Continuation

At the start of every session, check `docs/ai/SESSION_LOCK.json` before writing
or modifying files. If it exists and `expiresAt` is in the future, stop and report
a session conflict instead of proceeding. A new session lock must contain
`lockedBy`, `taskId`, `startedAt`, and `expiresAt`, with `expiresAt` exactly two
hours after `startedAt`.

If the human simply says "continue", do not restart the project and do not ask for
an explanation. Instead:

1. Read `docs/ai/AI_STATE.json`.
2. If `currentTask` is not null, resume it from `currentTask.remainingWork`.
3. If `currentTask` is null, start `nextTask` using `docs/ai/NEXT_TASK_PROMPT.md`.
4. Verify the documented state against the actual source before writing code.

At session end, and on failure or an unrecoverable blocker, clear/delete
`docs/ai/SESSION_LOCK.json` before finishing the session.

## X. Mandatory Chat Reporting Rule

This reporting rule applies to every future Coding AI session, on top of (not instead of) the existing Handoff Requirements section that updates `docs/ai/*` files.

### 1. Session Start Report

Before writing or modifying any code in a session, the Coding AI must post a message in the chat containing:

- Current milestone and task status (from `docs/ai/AI_STATE.json`)
- A brief list of what has already been completed (from `docs/ai/CHANGELOG.md`)
- What remains (from `docs/ai/ROADMAP.md`)
- The exact task about to be started now, and why (from `docs/ai/NEXT_TASK_PROMPT.md`)

### 2. End-of-Task Report

After completing each individual task, and **before** committing or pushing to GitHub, the Coding AI must post a report in the chat using exactly this structure:

```text
## Task: <task id and name>

**Objective:** <what this task was supposed to achieve>

**Files changed:**
- created: <list, or "none">
- modified: <list>
- deleted: <list, or "none">

**What changed (before -> after):** <concrete description of the logic/behavior change, not just filenames>

**Tests:** <how many tests added/changed, what they cover>

**Verification results:** typecheck: <pass/fail>, test: <pass/fail>, build: <pass/fail>

**Known issues resolved:** <list, or "none">

**New issues found:** <list, or "none">

**Next task:** <what the next task will be>
```

### 3. Rules

- Do NOT commit or push to GitHub until the end-of-task report has been posted in the chat.
- If a session completes multiple tasks, repeat the End-of-Task Report separately for EACH task — never merge tasks into one summary.
- This applies even to small or trivial changes.
- This chat report does not replace the file updates already required elsewhere in `AGENTS.md` — both must happen.
- A task is not considered complete until its commit has been merged onto `main` and pushed to `origin/main`. A completed commit that only exists on a feature branch (e.g. `v0/<task-id>-<description>`) does NOT satisfy the End-of-Task Report or the Handoff Requirements in Section O. Before posting the End-of-Task Report or updating `docs/ai/AI_STATE.json` to mark a task COMPLETE, the AI must:
  1. Merge the working branch into main with a normal (non-force) merge.
  2. Push main to origin.
  3. Fetch fresh from GitHub (not from local cache) and confirm main's HEAD SHA matches the commit just pushed.
  4. Only then include that verified main HEAD SHA in the End-of-Task Report — a SHA from a feature branch must never be reported as if it were on main.
