# BizFlow — AI Start Here

> You are not starting a new project. You are continuing an existing project.

## What This Is

**BizFlow** — an offline-first business and personal finance management app. React + TypeScript + Vite + Dexie/IndexedDB. 5-layer architecture: UI → Hooks → Services → Repository Interfaces → Dexie Repositories. No network calls. No cloud sync.

## Current State

- **Milestone:** P2P28 COMPLETE
- **Development status:** `PAUSED_AWAITING_INSTRUCTIONS`
- **Phase 3:** READY / awaiting explicit user requirements; implementation has not started
- **Tests:** 532 passing (47 files)
- **TypeScript:** PASS
- **Build:** PASS
- **Next task:** None — wait for the user to define Phase 3 requirements

Long-term direction is future-only: BizFlow may evolve toward an Offline-First + User Account + Cloud Sync + Multi-Device App. Future Cloud Readiness does not mean current cloud implementation; do not add accounts, authentication, cloud services, sync, or multi-device infrastructure now.

## What to Read (in order)

1. `AGENTS.md` — canonical instructions (repository root)
2. `docs/ai/AI_STATE.json` — machine-readable state
3. `docs/ai/AI_HANDOFF.md` — latest handoff
4. `docs/ai/NEXT_TASK_PROMPT.md` — exact next task instructions
5. `docs/ai/CURRENT_STATE.md` — detailed state
6. `docs/ai/ROADMAP.md` — roadmap
7. `docs/ai/KNOWN_ISSUES.md` — known issues
8. `docs/ai/ARCHITECTURE.md` — architecture reference
9. `docs/ai/GITHUB_SYNC.md` — commit and synchronization protocol

Then inspect the actual source code before making changes.

## What to Do

1. **Read** the files above
2. **Verify** the documented state against actual source code
3. **Implement** only the task in `NEXT_TASK_PROMPT.md`
4. **Test** — run `npm run verify` (typecheck + tests + build + import check + AI state check)
5. **Update** handoff documentation under `docs/ai/`
6. **Generate** the next task in `NEXT_TASK_PROMPT.md`
7. **Push** code and state together to GitHub — see `docs/ai/GITHUB_SYNC.md`
8. **Produce** a handoff report using `docs/ai/HANDOFF_TEMPLATE.md`

## Critical Rules

- Trust source code over documentation if they conflict
- Do not modify locked files (see `AGENTS.md` section H)
- Do not introduce Supabase, Firebase, or cloud sync
- Use integer minor units for money — never floating-point
- No network calls — the app is offline-first
- Do not ask a human or ChatGPT for the next task — determine it yourself
- Prefer small, verified, incremental changes over large rewrites
- No emojis in responses

## Locked Files

- `src/pages/DashboardPage.tsx` — LOCKED
- `src/components/layout/*` — LOCKED
- `src/routes/AppRoutes.tsx` — PROTECTED
- `src/db/database.ts` — PROTECTED
- `src/types/*` — PROTECTED
- `src/hooks/common/{useAsync,useMutation,ServiceProvider}.ts(x)` — PROTECTED
- All existing pages and tests — PROTECTED

See `AGENTS.md` section H for the full list.

## Task Status Vocabulary

`docs/ai/AI_STATE.json` uses exactly these statuses:
`PLANNED`, `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `COMPLETE`, `FAILED`.

Never record `COMPLETE` unless `npm run verify` actually passed.

## If the Previous AI Stopped Halfway

Check `AI_STATE.json` -> `currentTask`:

- `null` -> nothing in flight; start `nextTask`.
- `IN_PROGRESS` / `PARTIAL` -> read `currentTask.filesTouched`, `currentTask.completedWork`,
  `currentTask.remainingWork`, run `npm run verify` to see what actually passes, then either
  finish the work or revert it (`git checkout -- <files>`) and start clean. Say which you chose.
- `BLOCKED` / `FAILED` -> read `currentTask.blockedReason` before touching anything.
