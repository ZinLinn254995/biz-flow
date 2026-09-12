# BizFlow Product Blueprint

## P-BP1 — Product and Implementation Direction

**Status:** Documentation-only milestone; complete when verified and published.  
**Product:** Business Management + Personal Finance + Money Planning

## Product identity

BizFlow is a generic, finance-first, offline-first application for business owners, freelancers, sole proprietors, and personal users. It must work across food, retail, service, home-based, shop, seller, and other small-business models without hard-coding one business type. The current runtime remains local and offline; account, cloud sync, and multi-device capabilities are future direction only.

The current repository is a React 18 + TypeScript + Vite application using Dexie/IndexedDB, service and repository boundaries, integer minor-unit money, stable IDs, and Vitest verification. This blueprint describes product direction; it does not claim future features are implemented.

## Domain vocabulary

- **Item:** A reusable or one-time thing involved in selling, purchasing, using, or tracking.
- **Saved Item:** A reusable catalog item retained for repeated use.
- **Quick Item:** A one-time item entered without permanently expanding the reusable catalog.
- **Category:** A grouping for items, income, expenses, purchases, sales, and related records.
- **Favorite:** A frequently used saved item or action surfaced for quick access.
- **Quick Add:** A minimal-step entry workflow for common transactions.
- **Sale:** Money received from selling goods or services.
- **Purchase:** Acquisition of goods/items that may increase stock; it is not automatically an operating expense.
- **Business Expense:** An operating cost such as rent, fuel, electricity, salary, repair, packaging, or delivery; it may not affect stock.
- **Personal Income / Personal Expense:** Personal receipts and personal or household spending.
- **Optional Stock:** Stock tracking is enabled only where useful; not every item requires stock.

Stock must remain generic: raw, prepared, available, sold, remaining, damaged/lost quantities and in-stock, low-stock, or out-of-stock states are concepts, not a food-specific schema. Item identity, stock, purchase, preparation/transformation, sale, remaining stock, and business expense remain distinct.

## Product modules

### Business

The future Business module covers businesses, items, saved and quick items, categories, favorites, Quick Add, sales, purchases, optional stock, business expenses, customers where appropriate, accounts, history, reports, and daily/monthly/yearly/custom periods. Purchase acquisition and operating expense recording are separate workflows.

### Personal finance

The future Personal Finance module covers personal income, personal expenses, categories, saved/quick items, favorites, Quick Add, accounts, history, reports, charts, period comparison, and a Shopping Cart. Shopping Cart is only a quick-entry list for frequently purchased personal items; it is not e-commerce, online checkout, a marketplace, or a payment gateway.

### Money planning

Bills, budgets, and reserves are separate concepts:

- **Bill:** A known or expected future payment obligation, such as rent, internet, subscription, or a known monthly payment.
- **Budget:** A spending limit or target, such as fuel, electricity, food, or repairs.
- **Reserve:** Money intentionally set aside toward a future obligation. For example, a 3,000 THB monthly rent may have a 100 THB daily reserve target; reserved amount is accumulated allocation and remaining amount is target minus reserved amount.

Bill ≠ Budget. Budget ≠ Reserve. Reserve ≠ Expense. Reserve ≠ Account Balance. A reserve never automatically becomes an expense; the expense is recorded when the real payment occurs. Actual account balance, reserved amount, available amount, planned amount, and actual expense must remain distinguishable. Variable costs generally belong in budgets or optional estimates rather than mandatory fixed bills.

### Reporting and dashboard

The intended reporting direction includes daily, monthly, yearly, custom, and appropriate all-time periods; current-versus-previous comparisons; income, expenses, purchases, sales, net result, category/item totals, percentages, business-versus-personal views, charts, history, and drill-down details. The dashboard may surface business sales/expenses/net, personal income/expenses, overall result, upcoming bills, budget status, reserve progress, available amount, recent activity, and stock where enabled. This milestone does not change the existing Dashboard implementation.

## Quick-entry principle

Common actions should require minimal steps through Quick Add, Saved Items, Quick Items, Favorites, recent actions, reusable categories, fast amount/date entry, fast business/personal selection, optional stock entry, quick expenses, and quick purchases. Speed must not compromise validation, money accuracy, currency separation, or persistence correctness.

## Offline-first and future direction

Local business data remains available offline. The IndexedDB/Dexie layer remains the local data foundation; a PWA app shell should work offline after installation/cache when that future capability is authorized. GitHub is the source of code and documentation, while deployed hosting is the source of the latest application version; GitHub is not the runtime business-data source. Future Android packaging may use Capacitor or another suitable approach.

The following are explicitly out of scope for P-BP1 and must not be inferred as authorization: login, account creation, cloud sync, remote repositories, Supabase, Firebase, multi-device synchronization, conflict resolution, Capacitor, Android builds, encryption, account deletion, and cloud migration.

## Architecture rules

- Preserve React, TypeScript, Vite, Dexie/IndexedDB, and the current layered repository/service architecture.
- UI must not manipulate IndexedDB directly.
- Business logic belongs in application services; repositories own persistence.
- Use stable IDs and migrations for schema changes.
- Money is integer minor units; never use floating-point arithmetic for money.
- Never combine currencies incorrectly; totals remain per currency.
- Destructive operations require tests and transaction safety.
- Preserve backup/restore compatibility and distinguish sync-ready contracts from actual cloud sync.
- Keep locked areas protected and run domain, persistence, architecture, import, and state verification for relevant changes.
- Do not regress offline or PWA behavior.

## Dependency-aware roadmap

Each milestone requires explicit owner authorization, a scoped decision record, implementation evidence, updated continuity state, and passing verification before it can be marked complete.

| Milestone | Objective | Dependencies | Out of scope |
|---|---|---|---|
| P5.1 Product & Domain Foundation | Confirm future product/domain contracts against current code | P-BP1 | Account/cloud/sync implementation |
| P5.2 Categories and Items | Generalize item/category foundations | P5.1 | Remote persistence |
| P5.3 Saved Items and Quick Items | Add reusable and one-time item workflows | P5.2 | E-commerce |
| P5.4 Favorites and Quick Add | Add fast-entry primitives | P5.3 | Reduced validation |
| P5.5 Sales Enhancements | Expand generic sale workflows | P5.2–P5.4 | Payment gateway |
| P5.6 Purchases | Model acquisition separately from expenses | P5.2 | Treating all purchases as expenses |
| P5.7 Optional Stock Enhancements | Support configurable stock workflows | P5.5–P5.6 | Single-business schema |
| P5.8 Business Expenses Enhancements | Improve operating-cost workflows | P5.1 | Automatic stock changes for every expense |
| P5.9 Personal Finance Enhancements | Expand personal income/expense workflows | P5.1–P5.4 | Online shopping |
| P5.10 Quick Expense and Shopping Cart | Add fast personal entry tools | P5.4, P5.9 | Checkout or marketplace |
| P5.11 Bills | Track expected obligations | P5.1 | Auto-recording expenses |
| P5.12 Budgets | Improve spending targets and tracking | P5.1, P5.9 | Replacing account balances |
| P5.13 Reserves | Track allocations toward obligations | P5.11–P5.12 | Treating reserves as expenses |
| P5.14 Reports | Add detailed period reports | Earlier business/personal modules | Cloud analytics |
| P5.15 Period Comparison | Compare current and prior periods | P5.14 | Incorrect cross-currency totals |
| P5.16 Charts | Add visual reporting | P5.14–P5.15 | Decorative-only metrics |
| P5.17 Dashboard Integration | Integrate approved reporting/planning views | P5.11–P5.16 | Rewriting dashboard without authorization |
| P5.18 UX Consistency and Final Hardening | Standardize flows and close verified gaps | P5.1–P5.17 | Unreviewed architecture changes |

P5.1 is the next conceptual milestone, but it is not started or authorized by this documentation milestone.

## AI continuation and publication rules

GitHub `main` is the source of truth. A future authorized milestone must: read `AGENTS.md` and `AI_STATE.json`; confirm explicit authorization; inspect Git state; make only in-scope changes; run required verification; review files; commit meaningfully on a feature branch; push and verify the branch; merge through a normal PR or approved non-force process; verify `origin/main`; update state, handoff, decision, and evidence; report the next recommendation; and stop. A clean local tree is not publication proof. Never force-push, rewrite history, expose secrets, auto-merge unreviewed code, or silently continue to another milestone.

## P-BP1 acceptance

- Documentation only; no `src/` or dependency changes.
- Product identity, domain vocabulary, module boundaries, planning distinctions, architecture constraints, roadmap, and continuation rules are recorded here.
- P5.1 remains explicitly unauthorized.
- Verification evidence and publication status must be recorded separately and proven by Git remote checks.
