# BizFlow AI Start Here

BizFlow is an offline-first React, TypeScript, Vite, Dexie, and IndexedDB application. Follow `AGENTS.md`, then read `docs/ai/AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, and `NEXT_TASK_PROMPT.md` before changing files.

## Current state

P5.2, P5.3, P5.4, P5.5, and P5.6a are complete. P5.6b implementation is complete on its feature branch, while final main integration and verification are in progress. Current database version is 3.

## Rules

Preserve the UI → hooks → services → repository interfaces → Dexie architecture, offline-only behavior, integer minor-unit money, InventoryItem compatibility, existing sales and stock rules, and protected/locked files. A roadmap item is not authorization. Stop on contradictory state, migration discovery, backup-version changes, or unexpected protected-file impact.
