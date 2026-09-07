# BizFlow — AI Continuation Protocol

> This document defines exactly how ANY future Coding AI should continue the BizFlow project. Follow these 9 phases in order. Do not skip phases.

---

## PHASE 1 — ORIENT

Read the required AI documentation in this order:

1. `AGENTS.md` (repository root) — canonical instructions
2. `docs/ai/AI_START_HERE.md` — quick orientation
3. `docs/ai/AI_STATE.json` — machine-readable state
4. `docs/ai/AI_HANDOFF.md` — latest handoff from previous AI
5. `docs/ai/CURRENT_STATE.md` — detailed current state
6. `docs/ai/NEXT_TASK_PROMPT.md` — exact next task instructions
7. `docs/ai/PROJECT_CONTEXT.md` — project identity and domain model
8. `docs/ai/ARCHITECTURE.md` — technical architecture
9. `docs/ai/ROADMAP.md` — roadmap and next tasks
10. `docs/ai/DECISIONS.md` — architecture decisions
11. `docs/ai/KNOWN_ISSUES.md` — known issues and risks
12. `docs/ai/AI_TASK_SELECTION.md` — task selection rules
13. `docs/ai/QUALITY_GATE.md` — quality checklist

Do not skip any file. Each contains information needed to continue safely.

---

## PHASE 2 — VERIFY

Inspect the actual source code. Do not trust documentation blindly.

1. Verify the current milestone by checking `AI_STATE.json` and `CURRENT_STATE.md`
2. Run `npm run test` — verify the test count matches documentation
3. Run `npm run typecheck` — verify it passes
4. Run `npm run build` — verify it passes
5. Verify the architecture by checking that UI files do not import repositories/services/Dexie
6. Verify that the routes in `src/routes/AppRoutes.tsx` match the documented routes
7. Verify that the database tables in `src/db/database.ts` match the documented tables

**If documentation says something is complete but the code does not support it:**
1. Report the discrepancy in your handoff
2. Do not assume it is complete
3. Inspect tests to determine the actual state
4. Update the documentation only after verification

---

## PHASE 3 — AUDIT

Identify the actual state of the project:

- **Completed work:** Which milestones are actually implemented in the code?
- **Incomplete work:** Is anything partially implemented?
- **Regressions:** Have any previously-passing tests started failing?
- **Technical debt:** What dead code, architectural limitations, or missing tests exist?
- **Architecture violations:** Does any UI file import repositories, services, or Dexie?
- **Test failures:** Are all tests passing?
- **Build failures:** Does the production build succeed?
- **Discrepancies:** Does the documentation match the actual code?

Document any discrepancies between documentation and implementation.

---

## PHASE 4 — DECIDE

Determine the highest-priority safe next task.

Use `docs/ai/AI_TASK_SELECTION.md` for the priority framework. In summary:

1. **P0 — Data integrity / security / corruption risks** (address first)
2. **P1 — Architectural correctness / broken core infrastructure**
3. **P2 — Important business logic**
4. **P3 — Important user functionality**
5. **P4 — UX improvements**
6. **P5 — Nice-to-have enhancements**

**Do not blindly follow P2P numbering.** If P2P19 is listed as next but a critical data corruption bug is discovered, address the critical issue first. Explain why you deviated from the roadmap.

Check `docs/ai/AI_STATE.json` → `nextTask` for the current recommendation.
Check `docs/ai/NEXT_TASK_PROMPT.md` for the exact next task instructions.

**If `NEXT_TASK_PROMPT.md` explicitly defines a valid next task, follow it.**
**If it is stale or contradictory, inspect the actual repository and recalculate the correct next task.**

### Task Duplication Prevention

Before starting any task, compare:
- Current source code (does the work already exist?)
- `AI_STATE.json` → `progress.completedMilestones`
- `CURRENT_STATE.md` → completed tasks table
- `ROADMAP.md` → completed section
- `CHANGELOG.md` → recent entries

If the requested task is already complete: DO NOT implement it again. Instead:
1. Verify completion
2. Mark the state correctly
3. Select the next unfinished task

---

## PHASE 5 — PLAN

Create a concise implementation plan before writing code.

Specify:
- Task ID (e.g., P2P19)
- Objective (one sentence)
- Files expected to change (list)
- Files that must not change (locked areas)
- Dependencies (on other tasks or external systems)
- Risks (what could go wrong)
- Tests required (which test files to update or create)
- Acceptance criteria (exact conditions for completion)

Read the relevant source files before planning. Do not plan based on documentation alone.

---

## PHASE 6 — IMPLEMENT

Implement only the approved scope.

- Avoid unrelated refactoring
- Do not modify locked files without explicit justification
- Match existing code conventions (naming, imports, error handling, formatting)
- Do not add comments unless explaining a non-obvious WHY
- Do not introduce new dependencies
- Do not use floating-point for money
- Do not add network calls
- Prefer small, verified, incremental changes over large rewrites
- Write each file complete and correct on the first pass

---

## PHASE 7 — VERIFY

Run verification after implementation:

1. **Focused tests:** Run tests for the files you changed
   ```bash
   npx vitest run src/test/services/salesStockLogic.test.ts
   ```
2. **TypeScript check:**
   ```bash
   npm run typecheck
   ```
3. **Production build:**
   ```bash
   npm run build
   ```
4. **Full test suite:**
   ```bash
   npm run test
   ```
5. **Architecture constraint tests:**
   ```bash
   npx vitest run src/test/hooks/*UiConstraints.test.ts src/test/hooks/hookConstraints.test.ts src/test/hooks/serviceConstraints.test.ts
   ```
6. **Dangling imports check:** Verify no imports reference deleted or renamed files
7. **Routes check:** Verify all routes in `AppRoutes.tsx` resolve to existing pages

All must pass before declaring the task complete. Complete the `docs/ai/QUALITY_GATE.md` checklist.

---

## PHASE 8 — UPDATE HANDOFF

Update the AI handoff documentation after verification passes:

1. `docs/ai/AI_STATE.json` — Update milestone, tests, next task, known issues, progress
2. `docs/ai/CURRENT_STATE.md` — Update completed tasks, test status, technical debt
3. `docs/ai/AI_HANDOFF.md` — Update last completed task, next task, recent changes, next AI instructions
4. `docs/ai/NEXT_TASK_PROMPT.md` — Replace with the NEXT task's exact instructions (not a placeholder)
5. `docs/ai/CHANGELOG.md` — Append new milestone entry (do not rewrite history)
6. `docs/ai/KNOWN_ISSUES.md` — Mark resolved issues, add any new issues discovered
7. `docs/ai/ROADMAP.md` — Move completed task to "Completed", update "Next" section

**The AI must generate the next task automatically.** Do NOT leave "TODO: decide next task" or "Ask ChatGPT what to do next." That is forbidden.

Only update files where the completed work requires changes. Do not rewrite unchanged documentation.

---

## PHASE 9 — FINAL HANDOFF

Produce a structured final handoff report using `docs/ai/HANDOFF_TEMPLATE.md`.

The report must contain:
- Task completed (ID and name)
- Status (COMPLETE / BLOCKED / PARTIAL)
- Files changed (created, modified, deleted)
- Behavior changes (if any)
- Architecture impact (if any)
- Database impact (if any)
- Test results (count, pass/fail)
- TypeScript result
- Build result
- Security impact (if any)
- Known issues (new or remaining)
- Remaining risks
- Current project state (milestone, test count, build status)
- Next recommended task
- Next Coding AI task (actionable, copy-pastable)

This report is what the next AI agent will read. Make it accurate and complete.

---

## FAILURE RECOVERY

If implementation fails:

1. **Do NOT update the project as COMPLETE.**
2. Record the failure in `AI_HANDOFF.md` and `CHANGELOG.md`.
3. Diagnose the root cause — read the error, check assumptions, try a focused fix.
4. Fix the implementation.
5. Re-run verification: `npm run typecheck && npm run test && npm run build`.
6. Only then mark the task complete.

If the task cannot safely be completed:
- Mark it **BLOCKED** in `AI_STATE.json` and `AI_HANDOFF.md`.
- Document why it is blocked and what the next Coding AI must inspect.
- Do NOT invent a fake completion.
- Generate a BLOCKED handoff using `HANDOFF_TEMPLATE.md`.

---

## AI-TO-AI HANDOFF EXAMPLE

```
AI #1:
  Current: P2P18 COMPLETE
  Reads: AGENTS.md → AI_STATE.json → NEXT_TASK_PROMPT.md
  Implements: P2P19 (stock atomicity)
  Verifies: typecheck PASS, tests PASS, build PASS
  Updates: AI_STATE.json, CURRENT_STATE.md, AI_HANDOFF.md, NEXT_TASK_PROMPT.md, CHANGELOG.md, ROADMAP.md
  NEXT_TASK_PROMPT.md now says: P2P20 — Dead Code Cleanup

AI #2:
  Opens repository
  Reads: AGENTS.md → AI_STATE.json → NEXT_TASK_PROMPT.md
  Verifies: source code matches documented state
  Implements: P2P20 (dead code cleanup)
  Verifies: typecheck PASS, tests PASS, build PASS
  Updates: all handoff docs
  NEXT_TASK_PROMPT.md now says: P2P21 — Categories & Accounts Search

AI #3:
  Opens same repository
  Reads: AGENTS.md → AI_STATE.json → NEXT_TASK_PROMPT.md
  Continues: P2P21
  ...
```

This cycle continues indefinitely. No ChatGPT, human, or prompt engineer required between Coding AIs.
