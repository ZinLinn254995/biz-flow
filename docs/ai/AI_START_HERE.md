# BizFlow AI Start Here

BizFlow is an offline-first React, TypeScript, Vite, Dexie, and IndexedDB application. Follow `AGENTS.md`, then read `docs/ai/AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, and `NEXT_TASK_PROMPT.md` before changing files.

## Current state

P5.2, P5.3, and P5.4 are complete. P5.4 added persisted Saved Item favorites and preparation-only Quick Add without financial or stock mutation. The project is paused with no next task authorized; P5.5 is not started. Current database version is 2, and final P5.4 verification is recorded in `docs/ai/verification-logs/P5.4.log`.

## Rules

Preserve the UI → hooks → services → repository interfaces → Dexie architecture, offline-only behavior, integer minor-unit money, InventoryItem compatibility, existing sales and stock rules, and protected/locked files. A roadmap item is not authorization. Stop on contradictory state, migration discovery, backup-version changes, or unexpected protected-file impact.
