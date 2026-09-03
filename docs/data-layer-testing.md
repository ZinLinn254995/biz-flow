# BizFlow — Data Layer Testing

## Testing Strategy

Tests verify the P2P1–P2P3 data layer (domain types, Dexie database,
concrete repositories) using **Vitest** with **fake-indexeddb** to
provide an IndexedDB implementation in Node.js without a browser.

Tests are located in `src/test/` and run independently from the
production UI.

## Test Database Isolation

Each test file calls `createTestContext()` (see `src/test/helpers.ts`),
which creates a **fresh `BizFlowDB` instance with a unique name**
(e.g. `BizFlowDB_test_<timestamp>_<random>`). This means:

- Tests never touch the production `BizFlowDB` instance.
- Each test file gets its own isolated database.
- `afterEach` clears all tables between tests within a file.
- The production database remains clean — no test data persists.

## Repositories Covered

| Repository | Test File |
|---|---|
| Business | `businessRepository.test.ts` |
| Inventory | `businessScopedRepositories.test.ts` |
| Sale | `businessScopedRepositories.test.ts` |
| Customer | `businessScopedRepositories.test.ts` |
| BusinessExpense | `businessScopedRepositories.test.ts` |
| PersonalIncome | `personalFinanceRepositories.test.ts` |
| PersonalExpense | `personalFinanceRepositories.test.ts` |
| Category | `categoryRepository.test.ts` |
| Budget | `budgetAccountRepositories.test.ts` |
| Account | `budgetAccountRepositories.test.ts` |

## CRUD Coverage

Every repository is tested for:
- **create** — generates id, createdAt, updatedAt; persists record
- **getById** — returns correct record; returns null for missing ID
- **getAll** — returns all records; returns empty array when empty
- **update** — updates only requested fields; preserves id and
  createdAt; refreshes updatedAt; throws for missing record
- **remove** — deletes record; subsequent getById returns null

## Indexed Query Coverage

- **getByBusinessId** (Inventory, Sale, Customer, BusinessExpense) —
  tested with two distinct business IDs; verifies only matching
  records are returned and cross-business records are excluded.
- **getByScope** (Category) — tested with business and personal scopes;
  verifies only matching-scope categories are returned.

## Persistence Verification

`persistenceAndError.test.ts` verifies that records survive closing
and reopening the database connection — simulating a browser refresh.

## Offline-First Verification

`offlineVerification.test.ts` inspects repository and database source
files to confirm:
- No `fetch()` calls
- No Supabase imports
- No Firebase imports
- No Axios or XMLHttpRequest usage
- Only Dexie and domain type imports in the database layer

## Money Precision Verification

`moneyPrecision.test.ts` verifies that `Money` values (integer minor
units + currency code) are persisted and retrieved without
floating-point conversion.

## Timestamp Behavior Verification

`timestampBehavior.test.ts` verifies:
- create generates both createdAt and updatedAt
- createdAt and updatedAt are initially equal
- createdAt remains unchanged after update
- updatedAt changes after update
- Timestamps are valid ISO-8601 strings

## Error Behavior Verification

`persistenceAndError.test.ts` verifies:
- getById returns null for genuinely missing records (no throw)
- update throws when the target record does not exist
- remove does not throw for missing records
- Database errors propagate as rejected promises (never swallowed)

## Cleanup Strategy

- Each test file uses a uniquely-named test database.
- `afterEach` clears all relevant tables between tests.
- Test databases are closed after use.
- No test data reaches the production `BizFlowDB`.

## Known Limitations

- Tests use `fake-indexeddb` rather than a real browser IndexedDB.
  While highly compatible, subtle browser-specific IndexedDB behaviors
  may differ. Browser-based integration testing is a future concern.
- No React component testing — P2P4 is data-layer only.
- No performance/load testing — correctness is the focus.
