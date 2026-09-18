# Next Task Prompt

## NEXT TASK

P5.6a — Purchase domain, persistence, and stock logic

## STATUS

P5.6a is IN_PROGRESS. Continue only this governance repair and final verification. Do not begin P5.6b, P5.6c, P5.7, P4.2, cloud sync, authentication, multi-device support, or AI features.

## OBJECTIVE

Complete governance repair and verification for the already-existing purchase domain, persistence, repository, and stock implementation.

## SCOPE

- Preserve the existing P5.6a source implementation.
- Reconcile active P5.6a state and session-lock metadata.
- Capture fresh P5.6a verification evidence from the clean checkpoint commit.
- Preserve offline-first behavior, integer minor-unit money, and single-currency validation.

## EXCLUSIONS

- Do not begin P5.6b, P5.6c, P5.7, P4.2, cloud sync, authentication, multi-device support, or AI features.
- Do not modify purchase source code, dependencies, or unrelated application files.

## ACCEPTANCE CRITERIA

- The invalid P5.6b evidence is preserved byte-for-byte under its task-consistent historical filename.
- Active state remains P5.6a and IN_PROGRESS until fresh PASS evidence exists.
- Fresh P5.6a evidence records the exact verified commit SHA and all required commands pass.
- Full verification passes before P5.6a is finalized.

## VERIFICATION

Run `VERIFICATION_TASK_ID=P5.6a node scripts/capture-verification.mjs`, then `npm run verify` after the clean checkpoint and evidence/state updates.

## VERIFICATION COMMANDS

`npm run verify`
