# NEXT TASK

## NEXT TASK

P2P28 — Select the next roadmap task

> This file is the single source of truth for the next task. A new Coding AI needs nothing else
> from a human. Read `AGENTS.md` and `docs/ai/AI_STATE.json` first, then implement exactly this.

## Context

Everything through P2P22 is COMPLETE and verified (typecheck, 527 tests, build, import check,
AI state check all PASS). `Account` entities store a `balance`, but no service ever changes it:
creating an expense or income that names an `accountId` leaves the account balance untouched
(ISSUE-003). This is the highest remaining item and blocks accurate budget tracking in P2P24.

## OBJECTIVE

Keep `Account.balance` in sync with the transactions that reference `accountId`, applied atomically
with the transaction write.

## Scope

- `src/services/businessExpenses/BusinessExpenseService.ts`
- `src/services/personalFinance/PersonalIncomeService.ts`
- `src/services/personalFinance/PersonalExpenseService.ts`
- `src/services/accounts/AccountService.ts`
- `src/services/container.ts` (wiring only)
- `src/repositories/` — a transaction runner covering `[db.accounts, ...]` if a new one is needed
- Tests under `src/test/services/`

Do not touch any locked or protected file listed in `AI_STATE.json` -> `lockedAreas`.

## Rules

- Money is integer minor units. Never floating-point.
- A service must not import `@/db`. Atomicity comes from the injected `TransactionRunner` port
  (`src/services/common/transaction.ts`), implemented in the repository layer, exactly as P2P19 did.
  Services constructed without a runner must still work (direct execution) so mock-repository unit
  tests keep passing.
- A transaction whose currency differs from the account currency must be rejected with
  `ValidationError` from `@/services/common`, before any balance change.
- `accountId` remains optional. A transaction without one changes no balance.

## Behaviour to implement

| Operation | Effect on `Account.balance` |
|-----------|-----------------------------|
| Create expense (business or personal) with `accountId` | decrease by the expense amount |
| Create income with `accountId` | increase by the income amount |
| Update amount or `accountId` | reverse the previous effect, then apply the new one |
| Delete | reverse the effect |

## ACCEPTANCE CRITERIA

- All four table rows above are implemented for business expenses, personal expenses and personal income.
- Currency mismatch between transaction and account is rejected with `ValidationError`.
- Balance change and transaction write are applied through the injected `TransactionRunner`.
- No service imports `@/db`; all `*UiConstraints` and architecture tests still pass.
- New tests cover create, update and delete for both directions, plus the currency-mismatch rejection.
- `npm run verify` passes end to end.
- No changes to locked files and no removed assertions in existing tests.

## VERIFICATION COMMANDS

```bash
npm run verify
```

Runs `typecheck`, `test`, `build`, `verify:imports` and `verify:ai` in order. All must exit 0.

## After finishing

1. Re-run `npm run verify`.
2. Set `currentTask` to `null` and `lastCompletedTask` to P2P23 with status `COMPLETE` — only if
   verification actually passed.
3. Update `CURRENT_STATE.md`, `AI_HANDOFF.md`, `ROADMAP.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md`
   (mark ISSUE-003 resolved) and `AI_STATE.json`.
4. Rewrite this file for P2P24 (Budget Tracking).
5. Commit code and state together and push to `main` — see `docs/ai/GITHUB_SYNC.md`.
