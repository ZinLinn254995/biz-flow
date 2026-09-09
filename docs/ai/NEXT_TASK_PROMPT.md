# NEXT TASK

## Status

P3.6 — AUTHORIZED / NOT STARTED.

## NEXT TASK

P3.6 — Integrated Verification and Handoff

## OBJECTIVE

Integrate the continuity validators, decision records, verification evidence, handoff archives, and Git freshness checks into one documented end-to-end verification path without changing BizFlow application behavior.

## ACCEPTANCE CRITERIA

- Read the repository instructions and current AI state before changes.
- Preserve P3.1–P3.5 behavior and historical records.
- Add focused tests for any integration behavior changed.
- Keep application/business code untouched unless explicitly required.
- Run the complete verification suite and capture evidence.
- Create the required P3.6 handoff.

## VERIFICATION COMMANDS

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify:imports`
- `npm run verify:locked`
- `npm run verify:ai`
- `npm run verify:git-freshness`
- `npm run verify`

## RESTRICTIONS

Do not start cloud sync, authentication, accounts, Supabase, Firebase, or application features. Do not rewrite historical decision records or weaken P3.2, P3.3, P3.4, or P3.5 validation.
