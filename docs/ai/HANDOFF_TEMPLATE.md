# BizFlow — AI Handoff Report Template

> Copy this template and fill it after completing a task. This is the structured report that the next AI agent will read.

---

## TASK COMPLETION

- **Task ID:** [e.g., P2P19]
- **Task Name:** [e.g., Stock Operation Atomicity]
- **Status:** [COMPLETE / INCOMPLETE / PARTIAL]

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

## CURRENT PROJECT STATE

- **Current milestone:** [e.g., P2P19]
- **Status:** [e.g., COMPLETE]
- **Tests:** [N] passing ([N] files)
- **TypeScript:** [PASS / FAIL]
- **Build:** [PASS / FAIL]
- **Next milestone:** [e.g., P2P21]

## NEXT RECOMMENDED TASK

- **Task ID:** [e.g., P2P21]
- **Task Name:** [e.g., Categories & Accounts Search]
- **Why:** [One sentence explanation]
- **Scope:** [List of files likely affected]
- **Complexity:** [LOW / MEDIUM / HIGH]
- **Can combine with:** [Task ID, or "None"]

## NEXT CODING AI PROMPT

> Copy-paste the prompt below into the next Coding AI to continue development.

```
You are the implementation engineer continuing the existing BizFlow repository.

## MANDATORY CONTEXT

Read the following files before making any changes:
1. AGENTS.md
2. docs/ai/AI_START_HERE.md
3. docs/ai/AI_HANDOFF.md
4. docs/ai/CURRENT_STATE.md
5. docs/ai/PROJECT_CONTEXT.md
6. docs/ai/ARCHITECTURE.md
7. docs/ai/ROADMAP.md
8. docs/ai/DECISIONS.md
9. docs/ai/KNOWN_ISSUES.md
10. docs/ai/AI_CONTINUATION_PROTOCOL.md
11. docs/ai/AI_TASK_SELECTION.md
12. docs/ai/AI_STATE.json

Then:
- Inspect relevant source files
- Verify assumptions against actual code
- Determine actual current state
- Implement only the requested task
- Run: npm run typecheck, npm run test, npm run build
- Update handoff documentation under docs/ai/
- Produce a final handoff report using docs/ai/HANDOFF_TEMPLATE.md

## TASK

[Task ID]: [Task Name]

## OBJECTIVE

[One sentence objective]

## SCOPE

[Files expected to change]

## DO NOT TOUCH

[Locked areas — see AGENTS.md section H]

## ACCEPTANCE CRITERIA

[Exact conditions]

## TEST REQUIREMENTS

[Tests to run and expected results]
```

## LOCKED AREAS

All areas listed in `AGENTS.md` section H remain locked. [List any additional locked areas from this task, or "None added"]
