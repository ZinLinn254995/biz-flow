# BizFlow — AI Project Context Layer

## Purpose

This document is a navigation and decision layer for Coding AIs continuing BizFlow. It does not replace the repository's authoritative state, governance, implementation, or verification records. Read it to locate the right source, then verify every important claim against the repository, actual source code, tests, and Git.

## Project Identity

BizFlow is an offline-first business and personal finance management application for small business owners, freelancers, and sole proprietors. It tracks businesses, inventory, sales, customers, business expenses, personal income and expenses, categories, budgets, and accounts.

The application uses React 18, TypeScript, Vite, Tailwind CSS, React Router, and Dexie/IndexedDB. It has a five-layer architecture:

```text
UI → React Hooks → Application Services → Repository Interfaces → Dexie Repositories → IndexedDB
```

The current product is local-only. Network availability is not required, and no cloud provider, authentication system, or synchronization service is part of the current implementation unless a later milestone explicitly authorizes it.

## Non-Negotiable Project Rules

- Preserve offline-first behavior and local IndexedDB persistence.
- Keep UI, hooks, services, repository interfaces, and Dexie dependencies flowing downward.
- Keep business validation in services and persistence behind repository interfaces.
- Store and calculate money as integer minor units with an ISO currency; never introduce floating-point financial calculations.
- Preserve client-generated stable IDs, repository-managed timestamps, financial integrity, and existing business rules.
- Respect locked and protected areas in `AGENTS.md`.
- Preserve historical Phase 3 records and the existing AI continuity infrastructure.
- Do not add network calls, cloud providers, accounts, authentication, sync queues, migration execution, conflict UI, or multi-device behavior without explicit authorization.

## Source Map and Authority

| Source | Purpose | Authority |
|---|---|---|
| `AGENTS.md` | Governance, architecture constraints, locked areas, quality gates | Highest project instruction authority |
| Actual source code | What the application really implements | Highest implementation truth |
| Existing tests | Behavioral and architectural evidence | Authoritative verification evidence |
| `package.json` and build configuration | Commands, dependencies, and tooling | Authoritative project configuration |
| `docs/ai/AI_STATE.json` | Machine-readable milestone, task, quality, and Git state | Canonical continuity state |
| `docs/ai/CURRENT_STATE.md` | Human-readable current project state | State explanation; verify against code |
| `docs/ai/AI_HANDOFF.md` | Latest session handoff and continuation context | Current handoff; verify against state |
| `docs/ai/NEXT_TASK_PROMPT.md` | Exact next-task instructions or safety boundary | Task guidance; not authorization by itself |
| `docs/ai/PROJECT_CONTEXT.md` | Domain and architecture context | Reference context |
| `docs/ai/ARCHITECTURE.md` | Detailed architecture and dependency flow | Architecture reference |
| `docs/ai/ROADMAP.md` | Completed, planned, and future milestones | Planning only; not authorization |
| `docs/ai/KNOWN_ISSUES.md` | Known issue and technical-debt register | Issue record |
| `docs/ai/DECISIONS.md` | Permanent architecture decisions | Decision record |
| `docs/ai/task-decisions/` | Task-specific owner decisions and rationale | Decision evidence for that task |
| `docs/ai/handoffs/` | Historical milestone and task handoffs | Historical continuity evidence |
| `docs/ai/verification-logs/` | Captured command results and provenance | Verification evidence |
| Git and remote branches | Branch, commit, merge, and push provenance | Repository truth |

When sources disagree, do not choose the convenient answer. Report `BLOCKED_BY_REPOSITORY_INCONSISTENCY`, identify the conflicting sources and values, and repair the contradiction before implementation.

## Deterministic Startup Protocol

Before writing code:

1. Read `AGENTS.md`.
2. Read `docs/ai/AI_START_HERE.md` and this context layer.
3. Read `docs/ai/AI_STATE.json`.
4. Read `docs/ai/CURRENT_STATE.md` and `docs/ai/AI_HANDOFF.md`.
5. Read `docs/ai/NEXT_TASK_PROMPT.md`.
6. Read the relevant roadmap, architecture, known-issue, decision, handoff, and verification records.
7. Inspect the actual source code, tests, and package scripts for the task.
8. Inspect Git status, branch, HEAD, remotes, authoritative branch, ancestry, and freshness.
9. Compare documentation with implementation and verification evidence.
10. Determine authorization and the smallest in-scope next action.

Do not write code until current state, implementation status, verification status, and authorization are verified.

## Continuation and Authorization

“Continue” means inspect, understand, verify authorization, and then continue only with the repository's explicitly authorized workflow. It does not authorize invention, automatic roadmap progression, provider selection, or unrelated cleanup.

Distinguish these states:

- **Planned:** appears on a roadmap but is not authorized work.
- **Proposed:** suggested work awaiting owner approval.
- **Authorized:** owner or canonical task state explicitly permits implementation.
- **In progress:** an authorized task has an active `currentTask` and incomplete work.
- **Implemented:** code exists, but completion and provenance may still be unproven.
- **Finalized:** verification, documentation, and Git conditions are satisfied.
- **Complete:** the repository's completion contract is satisfied and state records it.
- **Blocked:** a required dependency, verification gate, or repository condition prevents safe progress.
- **Paused:** no task is active and no next task is authorized.

Decision tree:

```text
START
  ↓
Read governance, state, continuity records, source, tests, and Git
  ↓
Is important repository state contradictory?
  ├─ YES → BLOCKED_BY_REPOSITORY_INCONSISTENCY; stop
  └─ NO
       ↓
Is an active authorized currentTask present?
  ├─ YES → continue only that task
  └─ NO
       ↓
Is implementation present but not finalized?
  ├─ YES → verify/finalize only that implementation
  └─ NO
       ↓
Is the next milestone explicitly authorized?
  ├─ YES → read its requirements and begin only that milestone
  └─ NO → STOP; owner authorization required
```

A roadmap item is not authorization. If a value cannot be verified, record it as `UNKNOWN`; never invent a commit SHA, branch, remote, task, provider, verification result, or completion state.

## Completion Contract

Code existing does not equal task completion. A milestone may require implementation, focused tests, full tests, typecheck, production build, import and architecture validation, AI-state validation, Git freshness, merge/push provenance, final verification on the authoritative commit, and a durable handoff. Use the commands and requirements defined by the current `AGENTS.md`, `package.json`, state validator, and milestone records.

A completed task must leave behind enough evidence for another AI to identify what changed, why it changed, what passed, the final commit and branch, remaining work, explicit non-goals, and the next authorization requirement.

## Current and Future Direction

The long-term direction is **Offline-First + User Account + Cloud Sync + Multi-Device App**. The direction is future-only until the repository and owner explicitly authorize a milestone. Phase 4, when authorized, is expected to progress incrementally:

1. P4.1 — Sync-Ready Domain Contracts
2. P4.2 — Account + Device Foundation
3. P4.3 — Cloud Data + Synchronization
4. P4.4 — Migration + Conflict Resolution
5. P4.5 — Multi-Device + Security Hardening

These roadmap milestones are not automatic authorization. In particular, do not start P4.2 merely because P4.1 is complete or because P4.2 appears in a roadmap.

## Generating the Next Coding-AI Prompt

A generated prompt must be self-contained and derived from verified repository evidence. Include:

1. Role and project identity.
2. Current phase, milestone, task, status, branch, HEAD, and verification state.
3. Previous completed work and provenance.
4. Authorized objective and why it is authorized.
5. In-scope files, behavior, requirements, and acceptance criteria.
6. Existing implementation and relevant source/document paths.
7. Architecture, financial, offline-first, and locked-area constraints.
8. Explicit out-of-scope work, especially future milestones.
9. Focused tests and full verification commands.
10. Git, merge, push, and handoff requirements.
11. Stop condition and no-next-milestone rule.

If authorization is missing or evidence conflicts, generate a stop/blocker report instead of an implementation prompt.

## Context-Layer Acceptance Checklist

- A new AI can identify BizFlow, its stack, architecture, persistence, and domain rules.
- A new AI can locate canonical state, governance, handoffs, decisions, issues, roadmap, and verification evidence.
- A new AI can distinguish planning from authorization and implementation from completion.
- A new AI can determine when to continue, finalize, stop, or report a contradiction.
- This document remains an index and protocol layer, not a competing state system.
- Offline-first behavior, Phase 3 history, architecture boundaries, and verification gates remain protected.
- Future account, cloud, sync, migration, conflict, and multi-device work remains future-only until explicitly authorized.

This document describes how to navigate the repository. `AI_STATE.json`, `AGENTS.md`, source code, tests, Git, and milestone evidence remain authoritative for their respective purposes.
