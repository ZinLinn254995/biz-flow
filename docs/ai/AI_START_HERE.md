# BizFlow AI Start Here

BizFlow is an offline-first React, TypeScript, Vite, Dexie, and IndexedDB application. Follow `AGENTS.md`, then read `docs/ai/AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, and `NEXT_TASK_PROMPT.md` before changing files.

## Current state

P5.2, P5.3, and P5.4 are complete. P5.5 recovery is in progress on `v0/p5-5-sale-detail-receipt`: it adds a read-only sale detail page, browser receipt printing, and Sales UI navigation without changing financial or stock behavior. Current database version is 2. P5.6 is not authorized.

## Rules

Preserve the UI → hooks → services → repository interfaces → Dexie architecture, offline-only behavior, integer minor-unit money, InventoryItem compatibility, existing sales and stock rules, and protected/locked files. A roadmap item is not authorization. Stop on contradictory state, migration discovery, backup-version changes, or unexpected protected-file impact.
