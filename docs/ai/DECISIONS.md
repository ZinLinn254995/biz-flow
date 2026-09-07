# BizFlow — Architecture Decision Records

## Decision 1: Offline-First with Dexie/IndexedDB

**Decision:** BizFlow uses Dexie as the local database, backed by browser IndexedDB.

**Reason:** The application must work without any network connection. Small business owners may operate in areas with unreliable connectivity. Local-first ensures data is always available.

**Consequence:** Cloud synchronization is not currently available. Data is device-specific. If the user clears browser data, all data is lost. Future sync would require a remote backend.

---

## Decision 2: Repository Pattern with Interface Segregation

**Decision:** Repository interfaces are defined in `src/types/repositories/` as TypeScript interfaces. Concrete implementations in `src/repositories/` use Dexie.

**Reason:** Separating interface from implementation allows future adapter swaps (e.g., Supabase repository) without changing services or hooks. Enables test doubles via mock repositories.

**Consequence:** Slight indirection overhead. Two files per domain entity (interface + implementation). But the abstraction boundary is critical for testability and future sync.

---

## Decision 3: Service Layer with Constructor Dependency Injection

**Decision:** Each service receives its repository dependency through its constructor. `ServiceContainer` wires production singletons. `ServiceProvider` exposes via React context.

**Reason:** Enables unit testing with mock repositories. No global singletons leaking into service code. Services don't know about Dexie.

**Consequence:** Services must be constructed with their dependencies. The container handles this. Tests construct services with mock repos.

---

## Decision 4: Integer Minor-Unit Money

**Decision:** All monetary values use `Money { amountMinor: number, currency: string }` where `amountMinor` is an integer representing cents.

**Reason:** Floating-point arithmetic causes rounding errors. Integer minor units (cents) are precise for all financial calculations. Decimal conversion happens only at the presentation layer.

**Consequence:** UI forms must convert between decimal input and integer minor units. `formatMoney()` divides by 100 for display. All storage and calculation uses integers.

---

## Decision 5: Client-Generated UUID Identifiers

**Decision:** Entity IDs are generated client-side using `crypto.randomUUID()` (with fallback).

**Reason:** Stable IDs survive across local and remote storage. No dependency on database-generated IDs. Supports future sync where records are created offline and later matched to remote.

**Consequence:** IDs are strings (branded `EntityId` type). The repository `create()` method generates the ID, not the caller.

---

## Decision 6: Multi-Currency Per-Currency Totals

**Decision:** Financial totals are computed per-currency using `Map<string, number>`. Different currencies are never combined or converted.

**Reason:** Combining different currencies without exchange rates would produce meaningless totals. Per-currency totals are always correct.

**Consequence:** UI must display each currency separately. No single "total" across currencies. Future currency conversion would require exchange rate data.

---

## Decision 7: No Global State Library

**Decision:** React state management uses plain `useState` / `useEffect` / `useRef`. No Redux, Zustand, TanStack Query, or similar.

**Reason:** The app is simple enough that hooks + services + context suffice. Adding a state library would increase complexity without proportional benefit.

**Consequence:** Each hook manages its own loading/error state. No global cache. `refresh()` re-fetches from the service. Components may re-render on data changes.

---

## Decision 8: Manual Rollback for Stock Operations (Not Dexie Transactions)

**Decision:** Stock deduction and sale persistence are sequential operations with manual rollback, not wrapped in Dexie `db.transaction()`.

**Reason:** The original implementation was built without transactions for simplicity. Manual rollback handles the common error cases.

**Consequence:** If the process crashes between stock deduction and sale creation (or during rollback), inventory may be inconsistent. No concurrency protection. This is a known limitation (TD-03) and the proposed P2P19 task addresses it.

---

## Decision 9: Database Migration via Dexie Versioning

**Decision:** Schema changes use Dexie's `version(N).stores({...})` with upgrade functions. Never modify an existing version's schema.

**Reason:** Dexie's versioning system handles migrations safely. IndexedDB schema changes are destructive without proper upgrade paths.

**Consequence:** Adding tables or indexes requires incrementing the version number. Removing or changing existing indexes requires an upgrade function. Current version is 1.

---

## Decision 10: Architecture Constraint Tests

**Decision:** Automated tests verify that UI does not import Dexie, repositories, or services directly. Tests verify hooks use ServiceProvider. Tests verify services depend on interfaces.

**Reason:** Architectural rules decay without enforcement. Automated tests prevent regressions when multiple AI agents modify the codebase.

**Consequence:** 11 constraint test files must be maintained. Adding new pages requires adding corresponding constraint tests. But the architecture remains clean.

---

## Decision 11: No Cascade Delete

**Decision:** Deleting a record deletes only that record. No cascade deletes to children.

**Reason:** Cascade deletes are destructive and can cause data loss. Business logic for cascading is complex (what happens to sales when a business is deleted?).

**Consequence:** Deleting a business leaves orphaned inventory, sales, customers, and expenses. Future work may add cascade logic in the service layer.

---

## Decision 12: Branded EntityId Type

**Decision:** `EntityId` is a branded string type (`string & { readonly [__entityIdBrand]: true }`).

**Reason:** Prevents accidental cross-assignment of IDs at compile time (e.g., passing a Sale ID where a Customer ID is expected). The brand is erased at runtime.

**Consequence:** IDs must be cast when created (`as EntityId`). But type safety prevents a class of bugs.
