# GitHub Copilot Instructions — BizFlow

## Canonical Instructions

The canonical AI instruction file is `AGENTS.md` at the repository root. Follow it as the primary source of truth for all AI development instructions on this project.

## Mandatory Startup Protocol

1. Read `AGENTS.md`
2. Read `docs/ai/AI_START_HERE.md`
3. Read `docs/ai/AI_STATE.json`
4. Read `docs/ai/AI_HANDOFF.md`
5. Read `docs/ai/NEXT_TASK_PROMPT.md`
6. Inspect the actual source code before making changes

## Key Rules

- Trust source code over documentation if they conflict
- Do not modify locked files (see `AGENTS.md` section H)
- Prefer small, verified, incremental changes over large rewrites
- Do not introduce Supabase, Firebase, or cloud sync without explicit approval
- Use integer minor units for money — never floating-point
- No network calls — the app is offline-first
- Run `npm run typecheck`, `npm run test`, `npm run build` before declaring complete
- Update `docs/ai/` handoff documentation after completing work
- Do not ask a human or ChatGPT for the next task — determine it yourself from the repository

## AI Documentation System

All AI continuation documentation lives in `docs/ai/`. The key files are:
- `AI_STATE.json` — machine-readable project state
- `NEXT_TASK_PROMPT.md` — exact instructions for the next Coding AI
- `AI_HANDOFF.md` — latest handoff from the previous AI
- `AI_CONTINUATION_PROTOCOL.md` — 9-phase continuation cycle
