# Next Task Prompt

## NEXT TASK

P5.4 — Favorites and Quick Add

## STATUS

AUTHORIZED by the owner; implementation is NOT_STARTED. Preserve the paused state until the implementation session begins.

## OBJECTIVE

Implement the approved offline-first Saved Item workflow: persisted favorites with deterministic ordering and preparation-only Quick Add. Keep financial transaction creation, stock behavior, and existing validation boundaries unchanged.

## SCOPE

- Add optional `favoriteOrder` to SavedItem.
- Add repository and service operations for favorite lookup, toggling, and ordering.
- Add preparation-only Quick Add orchestration.
- Reuse existing categoryId and existing services.
- Add focused persistence, backup compatibility, service, and architecture tests.
- Keep Dexie at version 2 unless implementation evidence proves an indexed migration is necessary; stop for review before adding one.

## ACCEPTANCE CRITERIA

- Existing InventoryItem, sales, categories, backup compatibility, and offline behavior remain intact.
- No separate favorite table is introduced.
- Quick Add does not create sales, expenses, purchases, stock movements, or other financial records.
- Existing service validation remains authoritative.
- No visible workflow beyond the approved minimal Saved Item/favorite preparation surface.
- No P5.5 or unrelated refactors.

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

Stop and request review if repository state becomes contradictory, a Dexie migration is required, backup versioning must change, a locked file must change, Quick Add needs a financial transaction target, or the work exceeds the protected source-file limit.
