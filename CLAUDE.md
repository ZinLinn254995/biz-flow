# CLAUDE.md

This file provides instructions to Claude-based coding agents working on the BizFlow repository.

## Canonical Instructions

The canonical AI instruction file is `AGENTS.md` at the repository root. Read it first and follow it as the primary source of truth for all AI development instructions.

## Mandatory Startup Protocol

1. Read `AGENTS.md`
2. Read `docs/ai/AI_START_HERE.md`
3. Read `docs/ai/AI_STATE.json`
4. Read `docs/ai/CURRENT_STATE.md`
5. Read `docs/ai/AI_HANDOFF.md`
6. Read `docs/ai/NEXT_TASK_PROMPT.md`
7. Read `docs/ai/ROADMAP.md`, `docs/ai/ARCHITECTURE.md`, `docs/ai/KNOWN_ISSUES.md`, `docs/ai/DECISIONS.md`
8. Inspect the actual source code relevant to the current task
9. Verify documentation against actual implementation
10. Determine the exact unfinished task

Then inspect the actual source code before making changes.

## Key Rules

- Trust source code over documentation if they conflict
- Do not modify locked files (see `AGENTS.md` section H)
- Prefer small, verified, incremental changes
- Do not introduce Supabase, Firebase, or cloud sync without explicit approval
- Use integer minor units for money — never floating-point
- Run `npm run typecheck`, `npm run test`, `npm run build` before declaring complete
- Update AI handoff documentation after completing work
- Do not ask a human or ChatGPT for the next task — determine it yourself from the repository
