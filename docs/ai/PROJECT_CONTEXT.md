# BizFlow — Project Context

## Project Identity

| Field | Value |
|-------|-------|
| **Project name** | BizFlow |
| **Purpose** | Offline-first business and personal finance management application for small business owners |
| **Target users** | Small business owners, freelancers, and sole proprietors who need to track sales, inventory, expenses, and personal finances without requiring a network connection |
| **Core business problem** | Small business owners lack a simple, offline-capable tool that unifies business operations (sales, inventory, customers, expenses) with personal finance tracking (income, expenses, budgets, accounts) in a single application |
| **Current product vision** | A fully offline-first, local-first financial management application that works without any network dependency, with a clean architecture that can later support optional cloud sync |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.5.3 |
| Build tool | Vite | 5.4.8 |
| Routing | react-router-dom | 7.18.3 |
| CSS framework | Tailwind CSS | 3.4.1 |
| Icons | lucide-react | 0.446.0 |
| Database | Dexie (IndexedDB abstraction) | 4.4.5 |
| Testing framework | Vitest | 4.1.11 |
| Test rendering | @testing-library/react | 16.3.3 |
| Test environment | jsdom | 30.0.1 |
| Test IndexedDB | fake-indexeddb | 6.2.5 |
| Runtime | Browser (client-side only) | — |

**Dependencies of note:** `@supabase/supabase-js` is listed in `package.json` but is NOT imported or used anywhere in application code. Supabase credentials exist in `.env` but the app is fully offline-first.

## Architecture

```
UI (pages / components)
  ↓
React Hooks (useAsync, useMutation, domain hooks)
  ↓
Application Services (validation, orchestration, calculations)
  ↓
Repository Interfaces (src/types/repositories/)
  ↓
Concrete Repositories (src/repositories/ — Dexie implementations)
  ↓
Dexie / IndexedDB (src/db/database.ts)
  ↓
Device storage (browser IndexedDB)
```

**Dependency direction:** Each layer depends only on the layer below it. UI never imports Dexie, repositories, or services directly. Hooks import services only. Services import repository interfaces only. Concrete repositories import Dexie and the database instance.

**Dependency injection:** Services receive repository dependencies via constructor. The `ServiceContainer` wires production singletons. `ServiceProvider` exposes the container through React context. Tests override with mock containers.

## Architecture Rules

| Rule | Enforced by | Description |
|------|-------------|-------------|
| UI cannot import repositories | `*UiConstraints.test.ts` files | Pages must not import from `@/repositories` |
| UI cannot import services directly | `*UiConstraints.test.ts` files | Pages must not import from `@/services` (hooks use services) |
| UI cannot import Dexie/IndexedDB | `*UiConstraints.test.ts` files | No `dexie` or `indexeddb` imports in UI |
| Hooks access services via ServiceProvider | `hookConstraints.test.ts` | Hooks use `useServiceContainer()` |
| Services depend on repository interfaces | `serviceConstraints.test.ts` | Constructor params are interface types |
| No network calls | `offlineVerification.test.ts` | No `fetch`, `axios`, `http`, `supabase` in app code |
| Money uses integer minor units | `moneyPrecision.test.ts` | `Money.amountMinor` is always an integer |
| IDs are client-generated UUIDs | `timestampBehavior.test.ts` | `DexieRepository.create()` generates UUID, not caller |
| Timestamps auto-managed | `timestampBehavior.test.ts` | `createdAt`/`updatedAt` set by repository, not caller |
| Offline-first | `offlineVerification.test.ts` | All data persists to IndexedDB, no network dependency |

## Domain Model

### Business
Central entity. All business-scoped entities reference a Business via `businessId`.
- **Required:** `id`, `createdAt`, `updatedAt`, `name`, `currency`
- **Optional:** `description`
- **Relationships:** Has many InventoryItems, Sales, Customers, BusinessExpenses

### InventoryItem
Product or stock-keeping unit tracked by a business.
- **Required:** `id`, `createdAt`, `updatedAt`, `businessId`, `name`, `quantity`, `unit`, `costPrice`, `salePrice`, `stockStatus`
- **Optional:** `sku`, `reorderThreshold`
- **Relationships:** Belongs to Business. Referenced by SaleItem.inventoryItemId
- **Business rules:** `stockStatus` derived from `quantity` and `reorderThreshold`. Stock is deducted when sales are created, restored when sales are deleted.

### Sale
Sales transaction for a business.
- **Required:** `id`, `createdAt`, `updatedAt`, `businessId`, `date`, `items[]`, `totalAmount`, `paymentStatus`
- **Optional:** `customerId`, `notes`
- **Relationships:** Belongs to Business. May belong to Customer. Contains SaleItem[].
- **Business rules:** Creating a sale deducts inventory stock. Deleting restores stock. Payment status: pending/partial/paid/refunded.

### SaleItem
Line item within a sale.
- **Required:** `inventoryItemId`, `name`, `quantity`, `unitPrice`, `lineTotal`
- **Relationships:** References InventoryItem via `inventoryItemId`

### Customer
Customer associated with a business.
- **Required:** `id`, `createdAt`, `updatedAt`, `businessId`, `name`
- **Optional:** `email`, `phone`, `address`, `notes`
- **Relationships:** Belongs to Business. Referenced by Sale.customerId

### BusinessExpense
Expense record for a business.
- **Required:** `id`, `createdAt`, `updatedAt`, `businessId`, `title`, `date`, `amount`
- **Optional:** `categoryId`, `accountId`, `notes`
- **Relationships:** Belongs to Business. May reference Category and Account.

### PersonalIncome
Personal income record.
- **Required:** `id`, `createdAt`, `updatedAt`, `source`, `date`, `amount`
- **Optional:** `categoryId`, `accountId`, `notes`
- **Relationships:** May reference Category and Account.

### PersonalExpense
Personal expense record.
- **Required:** `id`, `createdAt`, `updatedAt`, `title`, `date`, `amount`
- **Optional:** `categoryId`, `accountId`, `notes`
- **Relationships:** May reference Category and Account.

### Category
Classification for expenses, income, or other records.
- **Required:** `id`, `createdAt`, `updatedAt`, `name`, `scope`
- **Optional:** `direction`, `parentId`, `color`
- **Relationships:** Scoped to business or personal. `parentId` for hierarchy (not enforced).

### Budget
Spending limit for a category over a period.
- **Required:** `id`, `createdAt`, `updatedAt`, `categoryId`, `limit`, `period`, `startDate`, `endDate`
- **Optional:** `notes`
- **Relationships:** References Category. Period: weekly/monthly/quarterly/yearly.

### Account
Liquid asset account.
- **Required:** `id`, `createdAt`, `updatedAt`, `name`, `type`, `balance`
- **Optional:** `institution`
- **Relationships:** Referenced by BusinessExpense, PersonalIncome, PersonalExpense via `accountId`. Type: cash/bank/wallet/other.

## Database

| Property | Value |
|----------|-------|
| Database name | `BizFlowDB` |
| Version | 1 |
| Technology | Dexie (IndexedDB) |
| Tables | 10 |
| Primary keys | Domain entity `id` (client-generated UUID) |
| Migration strategy | `this.version(N).stores({...})` — new version + upgrade function required for schema changes |
| Transaction strategy | **None.** No Dexie transactions used. Stock operations use manual rollback. |
| Persistence | Browser IndexedDB, survives page reloads |
| Seed data | None — database starts empty |

### Table indexes

| Table | Primary key | Indexed fields |
|-------|-----------|----------------|
| businesses | id | — |
| inventoryItems | id | businessId |
| sales | id | businessId, customerId, date |
| customers | id | businessId |
| businessExpenses | id | businessId, categoryId, date |
| personalIncomes | id | categoryId, accountId, date |
| personalExpenses | id | categoryId, accountId, date |
| categories | id | scope |
| budgets | id | categoryId, period |
| accounts | id | type |

## Security / Data Integrity

| Aspect | Status |
|--------|--------|
| Authentication | None — local app, no login |
| Authorization | None — single user, local data |
| Data encryption | IndexedDB browser-managed, no app-level encryption |
| Input validation | Service layer validates all inputs (`requireNonEmptyString`, `validateMoney`, `validateQuantity`) |
| Money integrity | Integer minor units only, never floating-point |
| Stock integrity | Manual rollback on failure, not atomic |
| Cascade delete | Not implemented — deleting a business does not delete children |

## Current Limitations

1. No Dexie transaction atomicity for stock operations
2. No concurrency protection on stock deduction
3. Account balances never update from transactions
4. No budget actual-vs-limit tracking
5. Analytics and Settings pages are placeholders
6. Orphaned dashboard components in `src/components/dashboard/` (7 files, no longer imported)
7. `useFilters.ts` hook created but unused (pages use inline `useMemo`)
8. CategoriesPage and AccountsPage lack search/filter/sort
9. No cascade delete
10. Sale `totalAmount` not validated against sum of `lineTotal`
11. No cloud sync, no Supabase usage
12. No data export/import
13. No PWA / service worker

## Future Direction

- **Cloud sync:** Architecture is designed for future sync (stable UUIDs, `createdAt`/`updatedAt`, `SyncStatus` type defined but unused). Supabase is available.
- **Analytics:** Analytics page placeholder exists, can be implemented with existing data hooks.
- **Account balance automation:** Services could be extended to update account balances when transactions reference `accountId`.
- **Budget tracking:** Budget service could compute actual spending vs limits.
- **Multi-user:** Not currently architected; would require auth + data partitioning.
