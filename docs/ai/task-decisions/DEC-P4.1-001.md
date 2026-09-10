# Task-Level Decision Record

## Decision ID
DEC-P4.1-001

## Task / Milestone
P4.1 — Sync-Ready Domain Contracts

## Decision
Adopt provider-neutral, type-level synchronization contracts while preserving BizFlow's offline-first architecture. P4.1 defines entity classification, ownership, stable identity, revisions, tombstones, sync state, schema version, migration state, and conflict assumptions without implementing authentication, networking, cloud storage, queues, migration execution, or conflict UI.

## Context / Problem
P4.1 required a durable, provider-neutral contract boundary before account, cloud, or multi-device work. The repository needed explicit metadata and state vocabulary while preserving the existing offline-first UI, service, repository, and IndexedDB architecture.

## Rationale
Defining identity, ownership, revisions, tombstones, synchronization state, schema version, migration state, and conflict assumptions before selecting a provider prevents accidental coupling and preserves safe future evolution. Focused tests and documentation make the boundary reviewable without introducing network behavior.

## Owner Decisions Applied
- Anonymous local use remains supported.
- Synchronization is entity-by-entity.
- Material conflicts use record-level optimistic versioning with explicit surfacing.
- Destructive account operations require export/recovery safeguards.
- Provider evaluation and selection occur after P4.1.

## Consequences
The existing UI → hooks → services → repository interfaces → Dexie flow remains unchanged. P4.2 and later work are not authorized by completing P4.1.

## Status
CURRENT

## Verification
Final evidence is recorded in `docs/ai/verification-logs/P4.1.log` and must reference the finalized main commit.
