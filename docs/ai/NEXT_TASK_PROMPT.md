# Next Task Prompt

## NEXT TASK

None. P5.5 — Sale Detail and Receipt — is complete.

## STATUS

Development is paused awaiting instructions. P5.5 is COMPLETE. P5.6 is not authorized.

## OBJECTIVE

No next implementation task is authorized. P5.5 completed the recovered offline-first Sale Detail workflow: a read-only sale detail page, browser receipt view/printing, and navigation from the existing Sales UI.

## SCOPE

- Add a parameterized `/sales/:saleId` route and read-only detail page.
- Add a presentational receipt with browser `window.print()` behavior.
- Add navigation from existing sale cards.
- Add focused behavior and UI architecture tests.
- Keep Dexie at version 2 and reuse existing hooks/services.

## ACCEPTANCE CRITERIA

- Existing sale, InventoryItem, stock, money, backup, and offline behavior remain intact.
- The detail view is read-only and displays persisted sale values without mutation.
- Printing uses the browser print API; no PDF generation is added.
- No payment history, refunds, tax, discounts, shipping, account balance, cloud, migration, or P5.6 work.
- `npm run verify` passes end to end.

## VERIFICATION COMMANDS

`npm run typecheck`
`npm run test`
`npm run build`
`npm run verify:imports`
`npm run verify:locked`
`npm run verify:git-freshness`
`npm run verify:ai`
`npm run verify`

## STOP CONDITIONS

Stop and request review if repository state becomes contradictory, a Dexie migration is required, backup versioning must change, a locked file must change, or the work exceeds the protected source-file limit.
