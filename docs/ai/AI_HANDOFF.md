# BizFlow AI Development Handoff

## PROJECT

BizFlow — offline-first business and personal finance management application.

## CURRENT MILESTONE

P-PWA1 — Installable Offline PWA — COMPLETE

## LAST COMPLETED TASK

P-PWA1 — Installable Offline PWA.

P-PWA1 added an installable offline PWA using `vite-plugin-pwa` (generateSW mode): a web manifest,
PWA icons (192×192, 512×512, maskable, apple-touch), a service worker that precaches 15 entries
(775.55 KiB), and a `PWAUpdatePrompt` component using `virtual:pwa-register/react`. The
implementation was created by v0 on branch `v0/pwa-installable-offline` (commit `9decb01`) and
merged to `main` via a non-destructive `--no-ff` merge (commit `8318ef0`), then published to
`origin/main`. Verification passed: 581/581 tests, typecheck, build, imports, locked-area,
git-freshness, AI verification, and `npm run verify` all PASS.

P4.1 — Sync-Ready Domain Contracts — remains COMPLETE. P4.1 added provider-neutral synchronization
contracts, focused tests, and continuity evidence while preserving the offline-first architecture.

## CURRENT TASK

`AI_STATE.json` -> `currentTask` is `null` and `nextTask` is `null`. P-PWA1 is complete and verified. The project is paused. No authentication, network, cloud, queue, or multi-device behavior is authorized.

## TASK STATUS VOCABULARY

`PLANNED`, `IN_PROGRESS`, `BLOCKED`, `PARTIAL`, `COMPLETE`, `FAILED`.
Never record `COMPLETE` unless `npm run verify` actually passed.

## NEXT TASK

None — P-PWA1 is complete and the project is paused. Do not begin P4.2 or implement authentication, cloud transport, sync queues, migration execution, conflict UI, or multi-device behavior.

See `docs/ai/NEXT_TASK_PROMPT.md` for exact implementation instructions.

## OVERALL PROGRESS

| Metric | Value |
|--------|-------|
| Completed milestones | 37 (P2P1–P2P28, P3.1–P3.7, P4.1, P-PWA1) |
| Remaining milestones | 4 (P4.2–P4.5) |
| Progress | 90% |
| Tests | 581 passing (52 files) |
| TypeScript | PASS |
| Build | PASS |

## IMPLEMENTED FEATURES

- Business CRUD with name, description, currency
- Inventory CRUD with stock tracking, cost/sale prices, reorder threshold, stock status
- Sales CRUD with multi-item line items, payment status, stock deduction/restoration
- Customer CRUD with contact information
- Business Expense CRUD with category and account references
- Personal Income/Expense CRUD with category and account references
- Category CRUD scoped to business/personal
- Account CRUD (cash, bank, wallet, other) with balance
- Budget CRUD with category, limit, period, date range and actual-spending progress
- Analytics page with multi-currency totals, monthly activity, and net position
- Dashboard with real-time financial summaries (business + personal), recent activity, low-stock alerts
- Multi-currency support (per-currency totals, never combined)
- Search, filter, sort, date-range on 8 list pages (all of them)
- Sale totals validated against line items, mixed-currency line items rejected
- Centralized financial calculations utility
- Inventory stock deduction/restoration with manual rollback

## RECENT CHANGES

| Task | Description | Date |
|------|-------------|------|
| P-PWA1 | Installable offline PWA (manifest, icons, service worker, update prompt) | 2026-09-10 |
| P4.1 | Sync-ready domain contracts | 2026-09-10 |
| P2P21+P2P22 | Categories/Accounts search + sale total validation | 2026-09-07 |
| P2P19+P2P20 | Stock atomicity + dead code cleanup | 2026-09-07 |
| P2P18 | Search/filter/sort on list pages | 2026-09-07 |
| P2P17 | Inventory stock logic in SalesService | 2026-09-07 |
| P2P16 | Centralized financial calculations | 2026-09-07 |
| P2P15 | Dashboard rewritten with real data | 2026-09-07 |
| P2P14 | Account & Budget management UI | earlier |
| P2P7-P2P13 | Full CRUD for all 10 management pages | earlier |

## FILES CHANGED (most recent task)

P-PWA1 created `public/apple-touch-icon.png`, `public/favicon.svg`, `public/maskable-icon-512x512.png`,
`public/pwa-192x192.png`, `public/pwa-512x512.png`, `src/pwa/PWAUpdatePrompt.tsx`,
`src/test/pwaConfig.test.ts`. Modified `index.html`, `package.json`, `package-lock.json`,
`src/main.tsx`, `src/vite-env.d.ts`, `vite.config.ts`. Nothing was deleted.

## FILES DELETED

None in the most recent task.

## TEST STATUS

| Metric | Value |
|--------|-------|
| Framework | Vitest 4.1.11 |
| Test files | 52 |
| Total tests | 581 |
| Passing | 581 |
| Failing | 0 |
| Verified | 2026-09-10 |

## TYPECHECK STATUS

PASS — `tsc --noEmit -p tsconfig.app.json` exits 0. Verified 2026-09-10.

## BUILD STATUS

PASS — `vite build` exits 0. Verified 2026-09-10. PWA artifacts: `dist/sw.js`, `dist/workbox-9c191d2f.js`, `dist/manifest.webmanifest`, 15 precache entries (775.55 KiB).

## KNOWN RISKS

1. **Account balances static** (ISSUE-003) — transactions don't update balances (next task, P2P23)
2. **No budget tracking** (ISSUE-004) — limits stored but no actual-vs-limit computation
3. **Single 515 kB JS bundle** (ISSUE-011) — no code splitting yet (low severity)

## KNOWN ISSUES

See `docs/ai/KNOWN_ISSUES.md` for the full register. Summary:

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| ISSUE-001 | Non-atomic stock operations | High | RESOLVED — P2P19 |
| ISSUE-002 | No concurrency protection | High | RESOLVED — P2P19 |
| ISSUE-003 | Account balances never update | Medium | Open — P2P23 |
| ISSUE-004 | No budget tracking | Medium | Open — P2P24 |
| ISSUE-005 | Sale total not validated | Medium | RESOLVED — P2P22 |
| ISSUE-006 | Orphaned dashboard components | Low | RESOLVED — P2P20 |
| ISSUE-007 | Unused useFilters.ts | Low | RESOLVED — P2P20 |
| ISSUE-008 | Categories/Accounts missing search | Low | RESOLVED — P2P21 |
| ISSUE-009 | Supabase dependency unused | Low | Open |
| ISSUE-010 | No cascade delete | Low | Open |
| ISSUE-011 | Single 509 kB bundle, no code splitting | Low | Open |
| ISSUE-012 | No PWA / Service Worker | Future | RESOLVED — P-PWA1 |

## ARCHITECTURE CONSTRAINTS

- UI cannot import repositories, services, or Dexie
- Hooks access services via ServiceProvider context
- Services depend on repository interfaces only
- No network calls — fully offline-first
- Money uses integer minor units — never floating-point
- IDs are client-generated UUIDs
- Timestamps auto-managed by repository layer

## LOCKED AREAS

| Area | Status |
|------|--------|
| `src/pages/DashboardPage.tsx` | LOCKED |
| `src/components/layout/AppShell.tsx` | LOCKED |
| `src/components/layout/Sidebar.tsx` | LOCKED |
| `src/components/layout/MobileNavigation.tsx` | LOCKED |
| `src/routes/AppRoutes.tsx` | PROTECTED |
| `src/config/navigationItems.ts` | PROTECTED |
| `src/db/database.ts` | PROTECTED |
| `src/types/` | PROTECTED |
| `src/types/repositories/` | PROTECTED |
| `src/repositories/dexieRepository.ts` | PROTECTED |
| `src/hooks/common/useAsync.ts` | PROTECTED |
| `src/hooks/common/useMutation.ts` | PROTECTED |
| `src/hooks/common/ServiceProvider.tsx` | PROTECTED |
| All completed pages | PROTECTED |
| All existing tests | PROTECTED |

## IMPORTANT DECISIONS

See `docs/ai/DECISIONS.md` for 12 architecture decision records. Key decisions:
- Offline-first with Dexie/IndexedDB (no network dependency)
- Repository pattern with interface segregation
- Constructor dependency injection via ServiceProvider
- Integer minor-unit money (never floating-point)
- Client-generated UUID identifiers
- Multi-currency per-currency totals (never combined)
- No global state library
- Atomic stock operations via an injected `TransactionRunner` port (P2P19)
- Architecture constraint tests enforce layer boundaries

## NEXT CODING AI INSTRUCTIONS

The project is paused. The next Coding AI should:

1. Read `AGENTS.md` at the repository root
2. Read `docs/ai/AI_STATE.json` for machine-readable state
3. Read `docs/ai/NEXT_TASK_PROMPT.md` for exact task instructions
4. Verify the current state against actual source code
5. Confirm `developmentStatus` is `PAUSED_AWAITING_INSTRUCTIONS` and `currentTask` is `null`
6. Do NOT start P4.2 or any implementation without explicit owner authorization
7. Do NOT add authentication, cloud sync, Supabase, Firebase, Capacitor, or hosting changes
8. Run `npm run verify` to confirm the documented baseline is real
9. Report the paused state and request written requirements from the project owner

---

## LAST SESSION — AI CONTINUATION SYSTEM UPGRADE (2026-09-07)

**Type:** infrastructure and documentation only. **No application source file was changed.**

### Verified baseline (clean `npm ci` install, commit `8c64406`)

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run test` | PASS — 45 files / 507 tests |
| `npm run build` | PASS — 509.77 kB bundle |
| `npm run verify:imports` | PASS |
| `npm run verify:ai` | PASS |

Documentation was found to be accurate: P2P18 is genuinely complete and P2P19 is
genuinely **not** started (`SalesService.ts` contains no `db.transaction`, and all 8
dead-code files still exist).

### Files created

- `scripts/verify-ai-state.mjs` — validates `AI_STATE.json` structure, statuses, referenced paths, and agreement with `NEXT_TASK_PROMPT.md` / `AI_HANDOFF.md` / `CURRENT_STATE.md`
- `scripts/check-dangling-imports.mjs` — resolves every relative import under `src/`
- `.github/workflows/ai-verify.yml` — CI verification gate (verification only; never writes code)
- `docs/ai/GITHUB_SYNC.md` — GitHub source-of-truth and commit protocol

### Files modified

`package.json` (added `verify`, `verify:ai`, `verify:imports` scripts), `AGENTS.md`,
`docs/ai/AI_STATE.json` (schema 2.0.0), `AI_START_HERE.md`, `AI_CONTINUATION_PROTOCOL.md`,
`CURRENT_STATE.md`, `QUALITY_GATE.md`, `CHANGELOG.md`, `NEXT_TASK_PROMPT.md`, this file.

### What changed conceptually

1. Task statuses are now an enforced enum (`PLANNED` ... `FAILED`) instead of prose.
2. `COMPLETE` is machine-checked against a recorded verification run.
3. Interrupted work is recorded in `AI_STATE.json` -> `currentTask` with
   `filesTouched` / `completedWork` / `remainingWork` / `recommendation`, so a new AI can
   resume or revert deliberately.
4. `AI_STATE.json` records `lastTaskFilesChanged`, `risks`, real `gitState`, and
   `nextAIInstructions`.
5. Handoff consistency is verified by CI, not by trust.
