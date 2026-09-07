# biz-flow

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-wkkvl8aa)

## AI-to-AI Development Handoff

BizFlow is developed using an AI-to-AI handoff workflow. The repository (when pushed to GitHub) is the single source of truth for the project's implementation state.

### Before modifying the project, AI agents must:

1. Read all files under `docs/ai/` — especially `AI_HANDOFF.md` and `CURRENT_STATE.md`
2. Verify the documented state against the actual source code — **trust the code over documentation if they conflict**
3. Understand the architecture rules in `ARCHITECTURE.md`
4. Check the locked areas list in `AI_HANDOFF.md` — do not modify protected areas
5. Review `ROADMAP.md` for the current development position and next task

### After completing a task, AI agents must:

1. Run all verification commands (`npm run typecheck`, `npm run test`, `npm run build`)
2. Update `docs/ai/AI_HANDOFF.md` with the new milestone and status
3. Update `docs/ai/CURRENT_STATE.md` with completed tasks and test results
4. Append an entry to `docs/ai/CHANGELOG.md`
5. Update `docs/ai/KNOWN_ISSUES.md` — mark resolved issues, add new ones
6. Update `docs/ai/NEXT_TASK_PROMPT.md` with the next task
7. Produce a handoff report using the template in `docs/ai/HANDOFF_TEMPLATE.md`

### Key principle

Source code and tests have higher authority than documentation. If documentation says something exists but the code does not contain it, trust the code. If documentation says something is complete but tests fail, mark the task incomplete.
