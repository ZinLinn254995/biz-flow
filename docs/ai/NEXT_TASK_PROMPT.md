# NEXT TASK

## NEXT TASK

P2P29 — Remove unused Supabase dependency

> This file is the single source of truth for the next task. Read `AGENTS.md` and `docs/ai/AI_STATE.json` first, then implement exactly this task.

## Context

P2P1–P2P27 are complete and verified. ISSUE-010 remains open: deleting a business removes only the business row, leaving inventory items, sales, customers, and business expenses orphaned in IndexedDB. This is the next concrete data-integrity task. The unused Supabase dependency and bundle-size/code-splitting concern remain lower-priority follow-up work.

## OBJECTIVE

Make business deletion remove the business and every business-owned child record as one atomic operation, without affecting unrelated businesses or personal finance records.

## Scope

- `src/services/business/BusinessService.ts`
- `src/types/repositories/` — only if a repository contract must be extended
- `src/repositories/` — cascade implementation and injected transaction wiring
- `src/services/container.ts` — wiring only if required
- Focused tests under `src/test/`

Do not touch locked files listed in `AI_STATE.json` unless explicitly justified. Do not introduce network calls or cloud sync.

## Rules

- Preserve the UI → hooks → services → repository architecture.
- Services must depend on repository interfaces, never import `@/db` directly.
- Use the injected `TransactionRunner` boundary for atomic deletion, following the P2P19 pattern.
- Deletion must be scoped by the target `businessId`; unrelated businesses and personal records must remain unchanged.
- Repeated deletion of a missing business should be safe and should not remove unrelated records.

## Behaviour to implement

| Operation | Expected effect |
|-----------|-----------------|
| Delete business | Remove the business, its inventory items, sales, customers, and business expenses atomically |
| Delete missing business | No-op or domain-appropriate not-found behavior, with no unrelated deletions |
| Delete one of multiple businesses | Remove only the selected business's children |
| Delete business with personal data present | Preserve personal incomes, personal expenses, categories, budgets, and accounts |

## ACCEPTANCE CRITERIA

- All business-owned child records are removed when their business is deleted.
- No orphaned inventory, sale, customer, or business-expense records remain for the deleted business.
- Records belonging to other businesses and all personal records remain intact.
- The cascade runs through the injected transaction boundary and cannot leave a partial delete on failure.
- Focused tests cover successful cascade deletion, business isolation, personal-data preservation, and failure/rollback behavior.
- `npm run verify` passes end to end.
- No application code outside the approved scope is changed, and no existing assertions are removed.

## VERIFICATION COMMANDS

```bash
npm run verify
```

Runs typecheck, tests, build, import checks, and AI-state validation in order. All must exit 0.

## After finishing

1. Run `npm run verify`.
2. Set `currentTask` to `null` and record P2P28 as COMPLETE only if verification passes.
3. Update `AI_STATE.json`, `CURRENT_STATE.md`, `AI_HANDOFF.md`, `ROADMAP.md`, `CHANGELOG.md`, and `KNOWN_ISSUES.md`.
4. Define the next task from the remaining low-priority issues, prioritizing either removal of the unused Supabase dependency or bundle/code-splitting improvements.
5. Commit the code and state together and push to `main` according to `docs/ai/GITHUB_SYNC.md`.
