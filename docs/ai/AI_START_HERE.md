# BizFlow AI Start Here

BizFlow is an offline-first React, TypeScript, Vite, Dexie, and IndexedDB application. Follow `AGENTS.md`, then read `docs/ai/AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, and `NEXT_TASK_PROMPT.md` before changing files.

## Current state

P5.2 through P5.8 are complete. P5.7 added the shared stock and cost foundation; P5.8 reconciled the existing business and personal expense workflows. The project is paused awaiting explicit owner authorization for the next milestone. Current database version is 3.

## Rules

Preserve the UI → hooks → services → repository interfaces → Dexie architecture, offline-only behavior, integer minor-unit money, InventoryItem compatibility, existing sales and stock rules, and protected/locked files. A roadmap item is not authorization. Stop on contradictory state, migration discovery, backup-version changes, or unexpected protected-file impact.
