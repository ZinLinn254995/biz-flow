# biz-flow

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-wkkvl8aa)

## Coding AI Continuation

BizFlow is designed for continuous development by multiple Coding AIs. No human prompt-engineering step is required between AI agents.

```
Coding AI A → GitHub → Coding AI B → GitHub → Coding AI C → GitHub → ...
```

### How it works

- **GitHub** is the shared memory and communication layer between Coding AIs.
- **`AGENTS.md`** (repository root) is the canonical instruction file for ALL Coding AIs.
- **`docs/ai/AI_STATE.json`** is the machine-readable project state.
- **`docs/ai/NEXT_TASK_PROMPT.md`** contains the exact executable instructions for the next Coding AI.
- **`docs/ai/AI_HANDOFF.md`** contains the latest handoff from the previous AI.
- **`docs/ai/AI_CONTINUATION_PROTOCOL.md`** defines the 9-phase continuation cycle.

### Before modifying the project, AI agents must:

1. Read `AGENTS.md` — canonical instructions
2. Read `docs/ai/AI_START_HERE.md` — quick orientation
3. Read `docs/ai/AI_STATE.json` — machine-readable state
4. Read `docs/ai/AI_HANDOFF.md` — latest handoff
5. Read `docs/ai/NEXT_TASK_PROMPT.md` — exact next task
6. Verify the documented state against actual source code — **trust the code over documentation if they conflict**
7. Inspect the relevant source files before making changes

### After completing a task, AI agents must:

1. Run verification: `npm run typecheck && npm run test && npm run build`
2. Update `docs/ai/AI_STATE.json` with the new milestone, tests, and next task
3. Update `docs/ai/AI_HANDOFF.md` with the new state and next AI instructions
4. Update `docs/ai/CURRENT_STATE.md` with completed tasks and test results
5. Update `docs/ai/NEXT_TASK_PROMPT.md` with the next task's exact instructions
6. Append an entry to `docs/ai/CHANGELOG.md`
7. Update `docs/ai/KNOWN_ISSUES.md` — mark resolved issues, add new ones
8. Update `docs/ai/ROADMAP.md` — move completed task, update next section
9. Produce a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`

### Key principle

Source code and tests have higher authority than documentation. If documentation says something exists but the code does not contain it, trust the code. If documentation says something is complete but tests fail, mark the task incomplete. The Coding AI itself must determine and document the next valid development task — no external prompt-engineering step is required.
