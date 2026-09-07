# BizFlow — AI Task Selection Rules

> This document defines how an AI should choose the next development task. Do not blindly follow P2P numbering — use these priority rules instead.

---

## Priority Framework

| Priority | Category | Description |
|----------|----------|-------------|
| **P0** | Data integrity / security / corruption risks | Must be addressed before anything else |
| **P1** | Architectural correctness / broken core infrastructure | Fix before adding features |
| **P2** | Important business logic | Core functionality that affects correctness |
| **P3** | Important user functionality | Features users need |
| **P4** | UX improvements | Better experience, not new functionality |
| **P5** | Nice-to-have enhancements | Optional improvements |

---

## Selection Process

1. **Check for P0 issues first.** Read `docs/ai/KNOWN_ISSUES.md` and look for any issue with severity "high" or "critical" that affects data integrity or security. If one exists and is not being addressed by the current recommended task, address it first.

2. **Check `docs/ai/AI_STATE.json` → `nextTask`.** This contains the current recommendation with priority and complexity.

3. **Check `docs/ai/NEXT_TASK_PROMPT.md`.** This contains the exact instructions for the next task. If it explicitly defines a valid next task, follow it.

4. **If `NEXT_TASK_PROMPT.md` is stale or contradictory**, inspect the actual repository and recalculate the correct next task using the priority framework above.

5. **Check `docs/ai/ROADMAP.md` → "Next Tasks" section.** This contains the planned next tasks.

6. **Verify the recommended task is still needed.** Read the relevant source code to confirm the issue still exists. If the issue has already been resolved (by a previous AI agent or by accident), skip to the next task.

7. **Consider task combinations.** Some tasks can be safely combined (noted in `canCombineWith` field in `AI_STATE.json`). Prefer combining naturally-related tasks for token efficiency.

8. **Choose the task.** Select the highest-priority task that is still needed and safe to implement.

---

## When to Deviate from the Roadmap

You MUST deviate from the P2P numbering if:

- A critical data corruption bug is discovered (address it first)
- An architecture violation is found (fix it first)
- A previously-passing test is now failing (fix the regression first)
- The recommended task has already been completed (skip to the next)
- The recommended task depends on another task that is not yet complete (do the dependency first)

When you deviate, you MUST explain why in your handoff report.

---

## Task Duplication Prevention

Before starting any task, compare:
- **Current source code** — does the work already exist in the code?
- **`AI_STATE.json` → `progress.completedMilestones`** — is the task listed as complete?
- **`CURRENT_STATE.md` → completed tasks table** — is the task listed?
- **`ROADMAP.md` → completed section** — is the task in the completed section?
- **`CHANGELOG.md` → recent entries** — was the task recently completed?

If the requested task is already complete: DO NOT implement it again. Instead:
1. Verify completion by inspecting the actual source code
2. Mark the state correctly in `AI_STATE.json`
3. Select the next unfinished task using the priority framework

---

## Current Recommendation (as of P2P18)

| Task | Priority | Complexity | Can Combine With | Status |
|------|----------|------------|-----------------|--------|
| P2P19 — Stock Operation Atomicity | P0 | MEDIUM | P2P20 | Recommended next |
| P2P20 — Dead Code Cleanup | P1 | LOW | P2P19 | Recommended next (combine) |
| P2P21 — Categories & Accounts Search | P2 | LOW | P2P22 | After P2P19+P2P20 |
| P2P22 — Sale Total Validation | P2 | LOW | P2P21 | After P2P19+P2P20 |
| P2P23 — Account Balance Updates | P2 | MEDIUM | None | After P2P21+P2P22 |
| P2P24 — Budget Tracking | P2 | HIGH | None | After P2P23 |
| P2P25 — Analytics Page | P3 | HIGH | None | After P2P24 |

**Rationale:** P2P19 addresses ISSUE-001 (non-atomic stock operations) and ISSUE-002 (no concurrency protection), which are the highest-severity known issues. P2P20 is low-risk dead code cleanup that can be done in the same pass for token efficiency.

---

## Task Size Guidelines

- **Ideal task:** 1-3 files changed, clear acceptance criteria, clear tests
- **Maximum task:** 5 files changed (unless explicitly justified)
- **Avoid:** Tasks that touch more than one architectural layer unnecessarily
- **Avoid:** Tasks that mix unrelated concerns
- **Prefer:** Small, verified, incremental changes over large rewrites

---

## Verification Before Starting

Before starting any task, verify:
1. The issue still exists in the code (read the relevant files)
2. No other AI agent has already started or completed the task
3. The task's dependencies are met
4. The task does not require modifying locked files (or if it does, you have justification)
