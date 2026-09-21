# Next Task Prompt

## NEXT TASK

P5.6b — Purchase workflow integration and UI

## STATUS

P5.6a is COMPLETE. P5.6b is ACTIVE under explicit owner authorization. Do not begin P5.6c, P5.7, P4.2, cloud sync, authentication, multi-device support, or AI features.

## OBJECTIVE

Implement the approved purchase-facing workflow using the existing P5.6a domain, PurchaseService, ServiceProvider architecture, and neighboring Sales/Inventory UI patterns.

## SCOPE

- Add purchase hooks, list/create/detail/edit/delete UI, approved routes/navigation, focused tests, verification evidence, and final handoff.
- Preserve the completed P5.6a implementation and canonical state semantics.

## EXCLUSIONS

- Do not begin P5.6b, P5.6c, P5.7, P4.2, cloud sync, authentication, multi-device support, or AI features.
- Do not modify purchase source code, dependencies, or unrelated application files.

## ACCEPTANCE CRITERIA

- Purchase workflow covers the owner-approved list, creation, detail, editing, and deletion behavior.
- P5.6a stock and financial rules remain unchanged.
- Full verification passes before P5.6b is finalized and development is paused again.

## VERIFICATION

Run focused tests during implementation and `npm run verify` before completion.

## VERIFICATION COMMANDS

`npm run verify`
