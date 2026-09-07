# BizFlow — AI Continuation Protocol

> This document defines exactly how ANY future Coding AI should continue the BizFlow project. Follow these 9 phases in order.

---

## PHASE 1 — ORIENT

Read the required AI documentation in this order:

1. `AGENTS.md` (repository root) — canonical instructions
2. `docs/ai/AI_START_HERE.md` — quick orientation
3. `docs/ai/AI_HANDOFF.md` — latest handoff from previous AI
4. `docs/ai/CURRENT_STATE.md` — detailed current state
5. `docs/ai/AI_STATE.json` — machine-readable state
6. `docs/ai/PROJECT_CONTEXT.md` — project identity and domain model
7. `docs/ai/ARCHITECTURE.md` — technical architecture
8. `docs/ai/ROADMAP.md` — roadmap and next tasks
9. `docs/ai/DECISIONS.md` — architecture decisions
10. `docs/ai/KNOWN_ISSUES.md` — known issues and risks
11. `docs/ai/AI_TASK_SELECTION.md` — task selection rules

Do not skip any file. Each contains information needed to continue safely.

---

## PHASE 2 — VERIFY

Inspect the actual source code. Do not trust documentation blindly.

1. Verify the current milestone by checking `docs/ai/AI_STATE.json` and `docs/ai/CURRENT_STATE.md`
2. Verify test count by running `npm run test`
3. Verify TypeScript by running `npm run typecheck`
4. Verify build by running `npm run build`
5. Verify the architecture by checking that UI files do not import repositories/services/Dexie
6. Verify that the routes in `src/routes/AppRoutes.tsx` match the documented routes
7. Verify that the database tables in `src/db/database.ts` match the documented tables

**If documentation says something is complete but the code does not support it:**
1. Report the discrepancy
2. Do not assume it is complete
3. Inspect tests
4. Determine the actual state
5. Update the documentation only after verification

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

Check `docs/ai/AI_STATE.json` → `nextRecommendedTasks` for the current recommendation.

Check `docs/ai/KNOWN_ISSUES.md` for severity-ranked issues.

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

All must pass before declaring the task complete.

Complete the `docs/ai/QUALITY_GATE.md` checklist.

---

## PHASE 8 — UPDATE HANDOFF

Update the AI handoff documentation after verification passes:

1. `docs/ai/AI_HANDOFF.md` — Update milestone, status, next task, handoff metadata
2. `docs/ai/CURRENT_STATE.md` — Update completed tasks, test status, technical debt
3. `docs/ai/AI_STATE.json` — Update machine-readable state (milestone, tests, risks, next tasks)
4. `docs/ai/CHANGELOG.md` — Append new milestone entry (do not rewrite history)
5. `docs/ai/KNOWN_ISSUES.md` — Mark resolved issues, add any new issues discovered
6. `docs/ai/NEXT_TASK_PROMPT.md` — Update with the next task's implementation prompt
7. `docs/ai/ROADMAP.md` — Move completed task to "Completed", update "Next" section

Only update files where the completed work requires changes. Do not rewrite unchanged documentation.

---

## PHASE 9 — FINAL HANDOFF

Produce a structured final handoff report using `docs/ai/HANDOFF_TEMPLATE.md`.

The report must contain:
- Task completed (ID and name)
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
- Next Coding AI prompt (copy-pastable into another AI tool)

This report is what the next AI agent will read. Make it accurate and complete.
