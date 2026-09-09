# P3.4 — Git Freshness Safety Checks

## Status
IN PROGRESS until the final commit is created and captured verification is regenerated.

## Implementation
Added `scripts/git-freshness.mjs`, which safely fetches `origin/main`, inspects branch/HEAD/remote/base/working-tree state, and classifies freshness as FRESH, STALE, DIVERGED, DIRTY, REMOTE_UNAVAILABLE, or UNKNOWN. Added `verify:git-freshness` and an opt-in strict gate to `verify:ai` via `REQUIRE_GIT_FRESHNESS=1`.

## Evidence Contract
Strict freshness requires a successful fetch, a named branch, a clean tree, valid `origin/main`, and either HEAD equal to origin/main or a feature branch whose merge base is origin/main.

## Tests
`src/test/gitFreshness.test.ts` covers matching main, current feature bases, dirty, stale, diverged, remote failure, unavailable state, detached HEAD, and unknown base state.

## Verification
Typecheck, focused P3.3/P3.4 tests, and production build passed. Full `npm run verify` and final captured evidence remain required after the final commit.

## Next Task
P3.5 — Task-Level Decision Records.
