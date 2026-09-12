# BizFlow — Architecture Reference

## Directory Structure

```
src/
├── pages/              # Route-level page components (13 pages)
├── components/         # Reusable UI components
│   ├── layout/         # AppShell, Sidebar, MobileNavigation, PageContainer
│   ├── ui/             # EmptyState
│   ├── business/       # BusinessCard, BusinessForm, DeleteBusinessDialog
│   ├── inventory/      # InventoryCard, InventoryForm, DeleteInventoryDialog
│   ├── sales/          # SaleCard, SaleForm, DeleteSaleDialog
│   ├── customers/      # CustomerCard, CustomerForm, DeleteCustomerDialog
│   ├── businessExpenses/ # BusinessExpenseCard, Form, DeleteDialog
│   ├── personalFinance/ # PersonalIncome/Expense Cards, Forms, DeleteDialogs
│   ├── categories/     # CategoryCard, CategoryForm, DeleteCategoryDialog
│   ├── accounts/       # AccountCard, AccountForm, DeleteAccountDialog
│   ├── budgets/        # BudgetCard, BudgetForm, DeleteBudgetDialog
│   └── dashboard/      # ORPHANED — 7 files no longer imported (TD-01)
├── hooks/              # React data-access layer
│   ├── common/         # useAsync, useMutation, useFilters (unused), ServiceProvider
│   ├── business/       # useBusinesses, useBusiness, useBusinessMutations
│   ├── inventory/      # useInventoryItems, useInventoryMutations
│   ├── sales/          # useSales, useSalesMutations
│   ├── customers/      # useCustomers, useCustomerMutations
│   ├── businessExpenses/ # useBusinessExpenses, useBusinessExpenseMutations
│   ├── personalFinance/ # usePersonalIncomeRecords, usePersonalExpenses, mutations
│   ├── categories/     # useCategories, useCategoryMutations
│   ├── budgets/        # useBudgets, useBudgetMutations
│   └── accounts/       # useAccounts, useAccountMutations
├── services/           # Application service layer
│   ├── common/         # validation.ts, errors.ts
│   ├── calculations/   # financialCalculations.ts
│   ├── business/       # BusinessService
│   ├── inventory/      # InventoryService
│   ├── sales/          # SalesService (stock deduction)
│   ├── customers/      # CustomerService
│   ├── businessExpenses/ # BusinessExpenseService
│   ├── personalFinance/ # PersonalIncomeService, PersonalExpenseService
│   ├── categories/     # CategoryService
│   ├── budgets/        # BudgetService
│   ├── accounts/       # AccountService
│   └── container.ts   # ServiceContainer wiring
├── repositories/       # Concrete Dexie repository implementations
│   ├── dexieRepository.ts # Abstract base class
│   ├── dexie*Repository.ts # 10 concrete repositories
│   └── index.ts        # Singleton exports
├── db/                 # Database layer
│   ├── database.ts     # BizFlowDB Dexie definition
│   └── index.ts        # Singleton db export
├── types/              # TypeScript type definitions
│   ├── common/         # base.ts (EntityId, Money, BaseEntity), enums.ts
│   ├── domain/         # 11 domain entity types
│   └── repositories/   # 11 repository interfaces
├── routes/             # AppRoutes.tsx
├── config/             # navigationItems.ts
└── test/               # All test files
```

## Dependency Flow

```
UI (pages / components)
  ↓ imports hooks
React Hooks (useAsync, useMutation, domain hooks)
  ↓ calls services via useServiceContainer()
Application Services (validation, orchestration, calculations)
  ↓ calls repository interface methods
Repository Interfaces (src/types/repositories/)
  ↓ implemented by
Concrete Repositories (src/repositories/ — Dexie)
  ↓ operates on
Dexie / IndexedDB (src/db/database.ts)
  ↓ persists to
Device storage (browser IndexedDB)
```

**Key rule:** Dependencies flow downward only. No layer imports from a layer above it.

## Domain Architecture

### Entities
11 domain entities defined in `src/types/domain/`. All extend `BaseEntity` (`id`, `createdAt`, `updatedAt`). Relationships expressed via ID references, not nested objects.

### Services
10 application services in `src/services/`. Each receives its repository via constructor injection. Services own validation and orchestration. `SalesService` additionally receives an optional `InventoryRepository` for stock management.

### Repositories
10 concrete Dexie repositories extending `DexieRepository<T>` base. Base provides `getById`, `getAll`, `create`, `update`, `remove`. Specialized repos add business-scoped queries using indexed fields.

### Hooks
Domain hooks wrap service calls with React state management. Read hooks use `useAsync` (loading/data/error + refresh). Mutation hooks use `useMutation` (mutate/isLoading/error/data + reset).

### UI
13 page components, each using `PageContainer` for layout. List pages have inline search/filter/sort using `useState` + `useMemo`. CRUD dialogs use forms + delete confirmation dialogs.

## Data Flow Example: Creating a Sale

```
User clicks "Save" in SaleForm dialog
  ↓
SalesPage calls useSalesMutations().createSale(input)
  ↓
useMutation wraps SalesService.createSale(input)
  ↓
SalesService validates input (businessId, date, items, totalAmount)
  ↓
SalesService.deductStock(items)
  ↓ (for each item)
InventoryRepository.getById(itemId) → check stock
InventoryRepository.update(itemId, {quantity, stockStatus}) → deduct
  ↓
SaleRepository.create(input) → persist sale
  ↓ (if create fails)
SalesService.restoreStock(items) → rollback
  ↓
useMutation sets data/error state
  ↓
SalesPage refreshes sale list
  ↓
UI re-renders with new sale
```

## Error Handling

| Layer | Strategy |
|-------|----------|
| Repository | Dexie errors propagate as thrown exceptions. `getById` returns `null` for not found. `update` throws if record missing after update. |
| Service | Throws `ValidationError` for invalid input. Propagates repository errors. `SalesService` rolls back stock on persistence failure. |
| Hook | `useAsync` catches errors into `error` state. `useMutation` catches errors into `error` state and rethrows. |
| UI | Pages display error state with retry button. Form dialogs display inline validation errors. |

## Validation

Validation happens in the **service layer** only. UI components do not validate business rules — they rely on services.

| Validator | Purpose |
|-----------|---------|
| `requireNonEmptyString(value, field)` | Trims string, throws `ValidationError` if empty |
| `validateMoney({amountMinor, currency}, field)` | Must be non-negative integer + non-empty currency |
| `validateQuantity(value, field)` | Must be non-negative integer |
| `trimToNull(value)` | Trims, returns null if empty (for optional fields) |

## Financial Calculation Rules

| Rule | Implementation |
|------|----------------|
| Money representation | `Money { amountMinor: number (integer cents), currency: string (ISO 4217) }` |
| Precision | Integer minor units only — never floating-point in storage or calculation |
| Currency handling | Per-currency totals using `Map<string, number>`. Different currencies are never combined. |
| Calculation utilities | `src/services/calculations/financialCalculations.ts` |
| `computeBusinessSummary(sales, expenses)` | Returns `{salesTotals, expenseTotals, netResult}` as per-currency Maps |
| `computePersonalSummary(incomes, expenses)` | Returns `{incomeTotals, expenseTotals, balance}` as per-currency Maps |
| `formatMoney(amountMinor, currency)` | Returns `"USD 500.00"` format string |
| `formatTotals(totals)` | Returns comma-separated multi-currency string or `"—"` for empty |

## Inventory Rules

### Stock Deduction (Sale Creation)
1. `SalesService.createSale()` validates all input
2. `deductStock(items)` aggregates quantities per `inventoryItemId`
3. For each item: fetches inventory, checks `quantity >= requested`, deducts, updates `stockStatus`
4. If any item fails (insufficient stock or not found): rolls back already-applied deductions, throws error
5. If `repository.create()` fails: calls `restoreStock(items)`, rethrows

### Stock Restoration (Sale Deletion)
1. `SalesService.deleteSale()` fetches the sale
2. `restoreStock(items)` adds quantities back to inventory
3. Calls `repository.remove(id)`
4. If remove fails: re-deducts stock (rollback), rethrows

### Stock Adjustment (Sale Update)
1. If `items` changed: fetches old sale, restores old stock
2. Deducts new stock (with rollback to re-deduct old if fails)
3. Calls `repository.update()` — if fails, restores new stock and re-deducts old stock

### Stock Status Computation
```
quantity <= 0                          → 'out_of_stock'
quantity <= reorderThreshold (if set)   → 'low_stock'
otherwise                              → 'in_stock'
```

### Atomicity
Stock movement and sale persistence run through the injected transaction boundary backed by a Dexie read-write transaction. The previously documented manual-rollback-only limitation is historical and was resolved in P2P19.

## Testing Architecture

| Test type | Location | Purpose |
|-----------|----------|---------|
| Repository tests | `src/test/*.test.ts` (non-hooks, non-services) | Verify Dexie CRUD, indexes, timestamps, ID generation |
| Service tests | `src/test/services/*.test.ts` | Verify validation, business logic, stock logic, calculations |
| Hook/page integration tests | `src/test/hooks/*.test.tsx` | Verify full UI flow: loading, empty, error, CRUD, refresh |
| Architecture constraint tests | `src/test/hooks/*UiConstraints.test.ts`, `hookConstraints.test.ts`, `serviceConstraints.test.ts` | Verify no forbidden imports (Dexie in UI, services in UI, etc.) |
| Core infrastructure tests | `src/test/moneyPrecision.test.ts`, `timestampBehavior.test.ts`, `persistenceAndError.test.ts`, `offlineVerification.test.ts` | Verify money precision, timestamp behavior, persistence, offline-first |

### Test environment
- **jsdom** for DOM rendering
- **fake-indexeddb** for in-memory IndexedDB in repository/integration tests
- **@testing-library/react** for component testing
- No mocking of service layer — tests use mock repositories injected into real services

## Future Direction

- **AI-Assisted Financial Record Management:** BizFlow will eventually support natural-language, voice, and receipt-photo input through a tool-based AI interaction layer. AI will use predefined BizFlow tools (not unrestricted database access) and the existing data layer remains the source of truth. The 5-layer architecture, dependency rules, and constraint tests remain in force. See `docs/ai/FUTURE_AI_DIRECTION.md` for the full architecture vision, tool categories, token-cost strategy, and OpenRouter plan.
- **Cloud sync:** Architecture is designed for future sync (stable UUIDs, `createdAt`/`updatedAt`, `SyncStatus` type defined but unused). Supabase is available.
- **Account balance automation:** Services could be extended to update account balances when transactions reference `accountId`.
- **Budget tracking:** Budget service could compute actual spending vs limits.
- **Multi-user:** Not currently architected; would require auth + data partitioning.
