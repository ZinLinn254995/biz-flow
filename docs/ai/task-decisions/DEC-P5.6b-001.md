# DEC-P5.6b-001 — Purchase Workflow Integration and UI

## DECISION ID

DEC-P5.6b-001

## TASK / MILESTONE

P5.6b — Purchase workflow integration and UI

## DECISION

Expose the existing PurchaseService through purchase hooks and add the approved purchase list, create/edit form, detail view, delete confirmation, route, and navigation entry. Add `supplierName` as an optional Purchase contract/service field because the approved P5.6b requirements require it while the actual P5.6a contract currently contains only `notes`.

## CONTEXT / PROBLEM

P5.6a provides purchase persistence and stock-aware service methods, but no hooks, pages, components, routes, or navigation. The approved P5.6b workflow requires supplier name, notes, item selection, quantity, unit cost, calculated totals, detail, editing, and deletion.

## RATIONALE

The implementation follows the established Sales and Inventory page/component/hook patterns. Supplier name is additive persisted object data and does not require a Dexie schema/index migration. All stock effects remain inside PurchaseService; UI code only assembles validated domain input and invokes hooks.

## CONSEQUENCES / TRADE-OFFS

The workflow remains offline-first and preserves integer minor-unit money and single-currency validation. No supplier entity, supplier repository, payment state, returns, purchase orders, or cloud behavior is introduced. The purchase form calculates presentation values in integer minor units from validated decimal input using the existing application convention.

## SCOPE EXCLUSIONS

P5.6c, P5.7, supplier management, purchase orders, returns, refunds, payment status/payables, COGS, tax, discounts, shipping, cloud sync, authentication, multi-device functionality, dependency upgrades, and unrelated refactoring.

## STATUS

CURRENT
