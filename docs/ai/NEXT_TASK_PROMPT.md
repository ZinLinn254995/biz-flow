# Next Task Prompt

## NEXT TASK

P5.6a — Purchase domain, persistence, and stock logic

## STATUS

P5.6a is IN_PROGRESS. Continue only this subtask. Do not begin P5.6b, P5.6c, P5.7, P4.2, cloud sync, authentication, multi-device support, or AI features.

## OBJECTIVE

Add the purchase aggregate, Dexie v3 persistence, backup-compatible repository wiring, and atomic inventory stock increases and reversals.

## SCOPE

- Add the Purchase and PurchaseItem domain contracts.
- Add the version 3 purchases table without modifying the existing version 1 schema.
- Add purchase repository interfaces and Dexie repository wiring.
- Add purchase service validation and stock adjustment behavior.
- Add focused domain, persistence, repository, service, and stock tests.
- Preserve offline-first behavior, integer minor-unit money, and single-currency validation.

## EXCLUSIONS

- Do not implement P5.6b or P5.6c.
- Do not add UI, hooks, routes, navigation, supplier entities, purchase returns, payment tracking, payables, account balance updates, purchase orders, cloud sync, authentication, multi-device support, or P5.7 work.

## ACCEPTANCE CRITERIA

- Purchase and purchase-line domain contracts validate integer minor-unit money and one currency per purchase.
- The version 3 purchases table persists purchase records without changing existing version 1 schema declarations.
- Purchase create increases inventory atomically with purchase persistence.
- Purchase edit reverses old stock and applies new stock safely.
- Purchase delete reverses stock safely.
- Backup-compatible repository wiring remains offline-first.
- Focused P5.6a tests pass.

## VERIFICATION

Run focused P5.6a tests and `npm run verify:ai` before proceeding to any later subtask.

## VERIFICATION COMMANDS

`npm run verify:ai`
