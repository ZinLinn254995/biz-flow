# BizFlow — AI Handoff Report Template

> Copy this template and fill it after completing a task. This is the structured report that the next AI agent will read. Support COMPLETE, BLOCKED, and PARTIAL states.

---

## TASK COMPLETION

- **Task ID:** [e.g., P2P19]
- **Task Name:** [e.g., Stock Operation Atomicity]
- **Status:** [COMPLETE / BLOCKED / PARTIAL]

---

## WHAT WAS CHANGED

[Summary of changes in 2-3 sentences]

## FILES CREATED

- [List with paths, or "None"]

## FILES MODIFIED

- [Path] — [brief description of change]

## FILES DELETED

- [List with paths, or "None"]

## BEHAVIOR CHANGES

- [Description of any user-visible behavior changes, or "None"]

## ARCHITECTURE IMPACT

- [Description of any architectural changes, or "None"]

## DATABASE IMPACT

- [Description of any database changes, or "None"]

## TEST RESULTS

- **Test framework:** Vitest [version]
- **Total tests:** [N]
- **Test files:** [N]
- **Passing:** [N]
- **Failing:** [N]
- **New tests added:** [N, or "None"]
- **Existing tests changed:** [List with reason, or "None"]

## TYPESCRIPT RESULT

- **Status:** [PASS / FAIL]
- **Command:** `npm run typecheck`

## BUILD RESULT

- **Status:** [PASS / FAIL]
- **Command:** `npm run build`

## SECURITY IMPACT

- [Description of any security-relevant changes, or "None"]

## KNOWN ISSUES

- **Resolved:** [List issue IDs, or "None"]
- **New:** [List new issues discovered, or "None"]
- **Remaining:** [List remaining relevant issues, or reference `docs/ai/KNOWN_ISSUES.md`]

## REMAINING RISKS

- [List any risks introduced or remaining, or "None"]

---

## CURRENT PROJECT STATE

- **Current milestone:** [e.g., P2P19]
- **Status:** [e.g., COMPLETE]
- **Tests:** [N] passing ([N] files)
- **TypeScript:** [PASS / FAIL]
- **Build:** [PASS / FAIL]
- **Next milestone:** [e.g., P2P21]

---

## NEXT RECOMMENDED TASK

- **Task ID:** [e.g., P2P21]
- **Task Name:** [e.g., Categories & Accounts Search]
- **Why:** [One sentence explanation]
- **Scope:** [List of files likely affected]
- **Complexity:** [LOW / MEDIUM / HIGH]
- **Can combine with:** [Task ID, or "None"]

---

## NEXT CODING AI TASK

> This section is directly actionable by the next Coding AI. No external explanation required.

The next Coding AI should:

1. Read `AGENTS.md` at the repository root
2. Read `docs/ai/AI_STATE.json` for machine-readable state
3. Read `docs/ai/NEXT_TASK_PROMPT.md` for exact task instructions
4. Verify the current state against actual source code
5. Implement [NEXT TASK ID] — [NEXT TASK NAME]
6. Run `npm run typecheck && npm run test && npm run build`
7. Update all handoff documentation under `docs/ai/`
8. Generate the next task in `NEXT_TASK_PROMPT.md`
9. Produce a handoff report using this template

**Do not ask a human or ChatGPT for the next task.** The repository contains everything needed to continue autonomously.

---

## LOCKED AREAS

All areas listed in `AGENTS.md` section H remain locked. [List any additional locked areas from this task, or "None added"]

---

## BLOCKED STATE (only fill if Status is BLOCKED)

- **Blocker:** [Description of what prevents completion]
- **Root cause:** [Description of the root cause]
- **What was attempted:** [Description of approaches tried]
- **What the next AI must inspect:** [Specific files, code, or tests to examine]
- **Suggested approach:** [Description of a potential solution path]
