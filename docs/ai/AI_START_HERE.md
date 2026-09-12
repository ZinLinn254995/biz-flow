# BizFlow AI Start Here

BizFlow is an offline-first React, TypeScript, Vite, Dexie, and IndexedDB application. Follow `AGENTS.md`, then read `docs/ai/AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, and `NEXT_TASK_PROMPT.md` before changing files.

## Current state

P5.2 and P5.3 are complete. P5.4 — Favorites and Quick Add — is owner-authorized but not started. The project is ready for the authorized implementation session; no P5.4 implementation has started. Current database version is 2. Verified P5.3 provenance is recorded in `docs/ai/verification-logs/P5.3.log`.

## Rules

Preserve the UI → hooks → services → repository interfaces → Dexie architecture, offline-only behavior, integer minor-unit money, InventoryItem compatibility, existing sales and stock rules, and protected/locked files. A roadmap item is not authorization. Stop on contradictory state, migration discovery, backup-version changes, or unexpected protected-file impact.
