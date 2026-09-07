# BizFlow — Data Architecture

## Offline-First Principle

BizFlow is designed as an offline-first, local-first application. All
read and write operations go through a repository layer backed by local
storage (IndexedDB via Dexie). The app never requires a network
connection for normal use.

## Layer Responsibilities

```
UI (pages / components)
  ↓
Feature logic (hooks / services)  ← calls repository contracts
  ↓
Repository interface  ← typed contracts, no storage knowledge
  ↓
Local data implementation  ← Dexie / IndexedDB (P2P2)
  ↓
Device storage
```

- **UI layer** renders data and captures user input. It never imports
  Dexie, IndexedDB APIs, or storage-specific types.
- **Repository contracts** (`src/types/repositories/`) define CRUD
  operations for each domain entity. They are TypeScript interfaces only.
- **Local data implementation** (`src/db/`) provides the Dexie/IndexedDB
  database instance and schema. P2P3 will add concrete repository classes
  that implement the contracts against this database.
- **Future cloud sync** can be added as an additional adapter alongside
  the local layer without changing UI or repository contracts.

## Domain Model Philosophy

Domain types (`src/types/domain/`) describe *what* the data means, not
*how* it is stored. They carry no imports from Dexie or IndexedDB.

Entities share a common identity pattern (`id`, `createdAt`, `updatedAt`)
defined in `BaseEntity`. Relationships are expressed via ID references
(`businessId`, `categoryId`, `accountId`) rather than nested objects,
keeping serialization flat and sync-friendly.

## Money Representation

Monetary values use the `Money` type: an integer `amountMinor` (cents)
plus an ISO 4217 `currency` code. Floating-point is never used for
storage or calculation. Decimal conversion happens only at the
presentation layer.

## Future Sync Preparation

Every entity has `createdAt` and `updatedAt` timestamps (ISO-8601 strings).
A `SyncStatus` union type is defined for future per-record sync state.
Stable client-generated IDs ensure records can be matched across local
and remote storage. No sync engine is implemented in P2P1.

## P2P1 Scope

P2P1 establishes types and contracts only. No database, no CRUD, no
business logic, no fake data, and no new dependencies were added.

## Database Layer (P2P2)

Dexie is used as the IndexedDB abstraction. `BizFlowDB` (defined in
`src/db/database.ts`) is the single shared database instance.

- **Database name:** `BizFlowDB`
- **Version:** 1 (initial schema)
- **Tables:** 10 tables, one per domain entity — `businesses`,
  `inventoryItems`, `sales`, `customers`, `businessExpenses`,
  `personalIncomes`, `personalExpenses`, `categories`, `budgets`,
  `accounts`.
- **Primary keys:** the domain entity `id` (EntityId) is the IndexedDB
  key — no separate database-generated IDs.
- **Indexes:** defined for expected query patterns (e.g. `businessId` on
  business-scoped tables, `categoryId` on finance tables, `scope` on
  categories, `type` on accounts, `date` on transaction tables).
- **No data:** the database starts empty. No seed or demo data.
- **No sync:** no network calls or cloud synchronization exists.
- **UI isolation:** UI components never import Dexie or access the
  database directly. P2P3 will add repository adapters that consume
  `db`.

Schema changes require incrementing the version number and providing a
Dexie upgrade function. Never modify an existing version's schema.

## Repository Layer (P2P3)

Concrete repository implementations now exist in `src/repositories/`.
Each implements its P2P1 repository contract against the centralized
`BizFlowDB` instance via Dexie table operations.

- **Abstraction boundary:** repository contracts (`src/types/repositories/`)
  remain the interface the application layer depends on. Concrete classes
  are implementation detail.
- **DexieRepository base:** a shared abstract class provides the five
  standard CRUD operations (`getById`, `getAll`, `create`, `update`,
  `remove`) for any `Table<T, EntityId>`. Specialized repositories extend
  it and add business-scoped or scope-filtered queries.
- **ID generation:** `create` generates a stable client-side UUID, plus
  `createdAt`/`updatedAt` timestamps. The caller never supplies these.
  `update` refreshes `updatedAt` automatically.
- **Indexed queries:** `getByBusinessId` uses the `businessId` index;
  `getByScope` uses the `scope` index. No full-table scans in JavaScript.
- **No cascade deletes:** removing a record deletes only that record.
  Relationship rules belong to future business-logic layers.
- **Singleton instances:** `src/repositories/index.ts` exports shared
  repository instances for future hooks/services to consume.
- **UI isolation:** no UI component imports repositories or Dexie yet.
  Application integration happens in a later phase.

## Application Service Layer (P2P5)

An application service layer sits between the UI and the repository
contracts. Each service owns application-level validation and
orchestration for a single domain area.

```
UI (pages / components)
  ↓
Application Services  ← validates input, orchestrates, calls repository contracts
  ↓
Repository Interfaces  ← typed contracts, no storage knowledge
  ↓
Dexie Repositories  ← concrete implementations against IndexedDB
  ↓
IndexedDB
```

- **Services** (`src/services/`) contain validation, input
  normalization, and delegation to repository interfaces. They do not
  import Dexie, the database, or concrete repository classes.
- **Dependency injection:** each service receives its repository
  dependency through its constructor, enabling test doubles and
  future adapter swaps without touching service code.
- **Repository ownership:** ID generation, `createdAt`, and
  `updatedAt` remain owned by the repository layer. Services pass
  creation input to repositories per the existing contract.
- **Money integrity:** services preserve the `Money` type (integer
  `amountMinor` + `currency`) without floating-point conversion.
- **Error propagation:** repository errors propagate to callers.
  Services throw `ValidationError` for invalid input and never return
  fake fallback data.
- **Offline-first:** services contain no network calls, Supabase
  imports, or cloud synchronization. The system remains fully
  offline-first.
- **UI isolation:** services are not yet connected to React pages.
  This phase establishes the service boundary only.

## React Data Access Layer (P2P6)

A React data-access layer now sits between the UI and the application
services. Hooks manage React lifecycle and async state; services
contain application logic; repositories own persistence.

```
React UI (pages / components)
  ↓
React Hooks  ← data-access / async state / mutations
  ↓
Application Services  ← validates input, orchestrates, calls repository contracts
  ↓
Repository Interfaces  ← typed contracts, no storage knowledge
  ↓
Dexie Repositories  ← concrete implementations against IndexedDB
  ↓
IndexedDB
```

- **Hooks** (`src/hooks/`) call application services — never
  repositories, Dexie, or IndexedDB directly. They manage
  `loading` / `data` / `error` state and expose a `refresh()` for
  reads and a `mutate()` for writes.
- **Service container** (`src/services/container.ts`) wires
  production repository singletons into service instances. A cached
  singleton is used so services are not re-created on every render.
- **Dependency injection via context:** `ServiceProvider` exposes
  the container through React context. Domain hooks obtain their
  service via `useServiceContainer()`. Tests replace the container
  with mock services, preserving the injection boundary.
- **No global state library:** hooks use plain `useState` /
  `useEffect` / `useRef`. No Redux, Zustand, TanStack Query, or
  other data-fetching framework is used.
- **StrictMode safety:** read hooks may execute more than once in
  development StrictMode; mutation hooks are never auto-triggered
  from `useEffect` — components call `mutate()` explicitly.
- **Lifecycle safety:** async operations check a `mountedRef` and
  a cancellation flag before setting state, preventing updates
  after unmount.
- **Error handling:** service rejections are surfaced as an `error`
  state — never swallowed, never converted to fake success data.
- **Dexie isolation:** hooks, services, and UI never import Dexie
  or the database. Only the repository layer (`src/repositories/`,
  `src/db/`) knows about Dexie and IndexedDB.
- **Offline-first:** the data-access layer introduces no network
  calls, Supabase imports, or cloud synchronization. All reads and
  writes ultimately flow through the local repository layer.
- **No UI changes:** this phase establishes the integration
  boundary only. The Dashboard and all pages remain unchanged
  with their existing empty-state UI.

## Account & Budget Management UI (P2P14)

Account and Budget management pages were added, completing the
configuration-level CRUD surface alongside Categories.

- **Accounts page** (`/accounts`) provides full CRUD for liquid-asset
  accounts (cash, bank, wallet, other). The form captures name, type,
  initial balance with currency, and optional institution. Money is
  converted from decimal input to integer `amountMinor` at the form
  boundary, preserving the existing `Money` architecture.
- **Budgets page** (`/budgets`) provides full CRUD for per-category
  spending limits. The form includes a category selector (populated via
  `useCategories`), budget limit with currency, period (weekly/monthly/
  quarterly/yearly), start/end dates, and optional notes. Budget cards
  display the category name, period badge, limit, and date range.
- **Hook-based data access:** both pages communicate exclusively through
  existing hooks (`useAccounts`, `useBudgets`, `useCategories` and their
  mutation counterparts). No UI component imports services, repositories,
  Dexie, or the database.
- **Route additions:** `/accounts` and `/budgets` were registered in the
  existing router. A "Configuration" navigation group groups Categories,
  Accounts, and Budgets.
- **Testing:** integration tests (`accountPage.test.tsx`,
  `budgetPage.test.tsx`) cover loading, empty, error, retry, CRUD flows,
  validation, service errors, refresh after mutations, category
  integration, and escape-to-close. Architectural constraint tests
  (`accountUiConstraints.test.ts`, `budgetUiConstraints.test.ts`)
  verify no imports of Dexie, repositories, services, or network APIs.
