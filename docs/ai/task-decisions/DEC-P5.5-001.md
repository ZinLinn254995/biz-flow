# DEC-P5.5-001 — Sale Detail and Receipt

## DECISION ID
DEC-P5.5-001

## TASK / MILESTONE
P5.5 — Sale Detail and Receipt

## DECISION
Implement sale detail as a read-only route backed by the existing `useSale` hook and render a browser-printable receipt with `window.print()`. Add navigation from the existing Sales UI without changing services, repositories, financial calculations, inventory behavior, or persistence schema.

## CONTEXT / PROBLEM
The recovered P5.5 implementation and commit are unavailable, but the authorized milestone requires users to inspect an existing sale and print its receipt while preserving BizFlow's offline-first architecture and financial safety rules.

## RATIONALE
The existing SalesService already provides `getSaleById`, and the hook layer exposes it through `useSale`. Reusing that path keeps the detail workflow read-only and preserves the UI-to-hooks-to-services boundary. Browser printing satisfies the receipt requirement without a new dependency or PDF pipeline.

## CONSEQUENCES / TRADE-OFFS
The receipt reflects the persisted sale snapshot, including its stored line-item names and money values. It does not calculate or mutate payment, tax, discount, shipping, account, or stock data. Printing relies on the browser's native print dialog.

## STATUS
CURRENT

## Verification
Focused sale detail behavior and architecture tests pass. Full verification evidence will be recorded in `docs/ai/verification-logs/P5.5.log` after the final implementation state is committed.

## Migration
No Dexie schema migration is required; the database remains version 2.

## Scope exclusions
No payment history, refunds, tax, discounts, shipping, account balance changes, PDF generation, cloud sync, dependency upgrades, inventory rule changes, P5.6 work, or unrelated refactoring.
