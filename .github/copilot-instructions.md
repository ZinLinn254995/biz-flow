# GitHub Copilot Instructions — BizFlow

## Canonical Instructions

The canonical AI instruction file is `AGENTS.md` at the repository root. Follow it as the primary source of truth for all AI development instructions on this project.

## Quick Start

1. Read `AGENTS.md` for the full instruction set
2. Read `docs/ai/AI_START_HERE.md` for quick orientation
3. Read `docs/ai/AI_HANDOFF.md` for the latest handoff state
4. Read `docs/ai/AI_STATE.json` for machine-readable project state
5. Inspect the actual source code before making changes

## Key Rules

- Trust source code over documentation if they conflict
- Do not modify locked files (see `AGENTS.md` section H)
- Prefer small, verified, incremental changes over large rewrites
- Do not introduce Supabase, Firebase, or cloud sync without explicit approval
- Use integer minor units for money — never floating-point
- No network calls — the app is offline-first
- Run `npm run typecheck`, `npm run test`, `npm run build` before declaring complete
- Update `docs/ai/` handoff documentation after completing work

## AI Documentation System

All AI continuation documentation lives in `docs/ai/`. See `AGENTS.md` section E for the full file listing and section F for the mandatory reading order.
