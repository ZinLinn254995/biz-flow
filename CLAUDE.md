# CLAUDE.md

This file provides instructions to Claude-based coding agents working on the BizFlow repository.

## Canonical Instructions

The canonical AI instruction file is `AGENTS.md` at the repository root. Read it first and follow it as the primary source of truth for all AI development instructions.

## Mandatory Reading

Before modifying any code, read:

1. `AGENTS.md` — canonical AI development instructions
2. `docs/ai/AI_START_HERE.md` — quick orientation
3. `docs/ai/AI_HANDOFF.md` — latest handoff state
4. `docs/ai/CURRENT_STATE.md` — detailed current state
5. `docs/ai/AI_STATE.json` — machine-readable state
6. `docs/ai/ARCHITECTURE.md` — technical architecture
7. `docs/ai/ROADMAP.md` — roadmap and next tasks
8. `docs/ai/KNOWN_ISSUES.md` — known issues and risks
9. `docs/ai/AI_CONTINUATION_PROTOCOL.md` — continuation protocol

Then inspect the actual source code before making changes.

## Key Rules

- Trust source code over documentation if they conflict
- Do not modify locked files (see `AGENTS.md` section H)
- Prefer small, verified, incremental changes
- Do not introduce Supabase, Firebase, or cloud sync without explicit approval
- Use integer minor units for money — never floating-point
- Run `npm run typecheck`, `npm run test`, `npm run build` before declaring complete
- Update AI handoff documentation after completing work
