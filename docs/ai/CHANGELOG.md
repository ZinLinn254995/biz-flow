# BizFlow — AI Development Changelog

> Future AI agents must append to this file. Do not rewrite history.

---

## AI Continuation System Upgrade — 2026-09-07

> Infrastructure and documentation only. No application source file was changed.

### Added
- `scripts/verify-ai-state.mjs` — validates `docs/ai/AI_STATE.json` (valid JSON, required keys,
  legal task statuses, referenced paths exist, `COMPLETE` requires passing verification,
  cross-checks `NEXT_TASK_PROMPT.md` / `AI_HANDOFF.md` / `CURRENT_STATE.md`)
- `scripts/check-dangling-imports.mjs` — resolves every relative import under `src/`
- `.github/workflows/ai-verify.yml` — CI gate running typecheck, tests, build, import check
  and AI state check on push/PR to `main` (verification only, never modifies source)
- `docs/ai/GITHUB_SYNC.md` — GitHub source-of-truth, commit convention and sync protocol
- npm scripts: `verify`, `verify:ai`, `verify:imports`

### Changed
- `docs/ai/AI_STATE.json` upgraded to schema 2.0.0: explicit status enum
  (PLANNED / IN_PROGRESS / BLOCKED / PARTIAL / COMPLETE / FAILED), recorded verification run,
  `lastTaskFilesChanged`, `risks`, `continuation`, `nextAIInstructions`, corrected `gitState`
- `AGENTS.md` — added status vocabulary, one-command verification, GitHub source-of-truth
  and same-chat continuation sections
- `docs/ai/AI_CONTINUATION_PROTOCOL.md` — added PHASE 10 (GitHub sync), status vocabulary and
  interrupted-task recording format
- `docs/ai/AI_START_HERE.md`, `QUALITY_GATE.md`, `CURRENT_STATE.md`, `AI_HANDOFF.md`,
  `NEXT_TASK_PROMPT.md` — aligned with the new verification and sync workflow

### Removed
- None

### Tests
- Total: 507 (unchanged)
- Files: 45 (unchanged)
- All passing

### Verification
- TypeScript: PASS
- Tests: PASS (507/507)
- Build: PASS
- Dangling imports: PASS
- AI state: PASS

### Next
- P2P19: Stock operation atomicity (wrap in Dexie transaction)
- P2P20: Dead code cleanup (delete orphaned dashboard components + unused useFilters.ts)

---

## P2P18 — 2026-09-07

### Changed
- DashboardPage rewritten with real data from 6 hooks (P2P15)
- SalesService updated to accept optional InventoryRepository for stock deduction (P2P17)
- ServiceContainer updated to pass inventoryRepository to SalesService (P2P17)
- 7 list pages updated with search/filter/sort/date-range controls (P2P18)
  - BusinessPage, InventoryPage, SalesPage, CustomersPage, BusinessExpensesPage, PersonalFinancePage, BudgetsPage
- Existing page tests updated to disambiguate assertions (getAllByText for status labels that now appear in both cards and filter dropdowns)
- SalesPage test updated to mock saleRepo.getById for delete and update operations

### Added
- `src/services/calculations/financialCalculations.ts` — centralized multi-currency financial calculations (P2P16)
- `src/test/services/financialCalculations.test.ts` — 16 tests for calculations (P2P16)
- `src/test/services/salesStockLogic.test.ts` — 12 tests for stock deduction/restoration (P2P17)
- `src/test/hooks/dashboardPage.test.tsx` — 7 tests for dashboard (P2P15)
- `src/hooks/common/useFilters.ts` — reusable filter hooks (P2P18, currently unused by pages)

### Removed
- None

### Tests
- Total: 507
- Files: 45
- All passing

### Verification
- TypeScript: PASS
- Tests: PASS
- Build: PASS

### Next
- P2P19: Stock operation atomicity (wrap in Dexie transaction)
- P2P20: Dead code cleanup (delete orphaned dashboard components + unused useFilters.ts)

---

## P2P14 — (Date unknown)

### Changed
- Added Account and Budget management pages with full CRUD

### Added
- `src/pages/AccountsPage.tsx`, `src/pages/BudgetsPage.tsx`
- `src/components/accounts/*` (AccountCard, AccountForm, DeleteAccountDialog)
- `src/components/budgets/*` (BudgetCard, BudgetForm, DeleteBudgetDialog)
- `src/hooks/accounts/*`, `src/hooks/budgets/*`
- Route registrations for `/accounts` and `/budgets`
- "Configuration" navigation group
- `src/test/hooks/accountPage.test.tsx`, `budgetPage.test.tsx`
- `src/test/hooks/accountUiConstraints.test.ts`, `budgetUiConstraints.test.ts`

### Verification
- (Not verified in this session — historical entry)

---

## P2P1–P2P13 — (Dates unknown)

### Summary
- P2P1: Domain types, enums, repository interfaces
- P2P2: Dexie/IndexedDB database with 10 tables
- P2P3: 10 concrete Dexie repositories + base class + singletons
- P2P5: 10 application services with validation + DI
- P2P6: React data access layer (hooks, useAsync, useMutation, ServiceProvider)
- P2P7–P2P13: Full CRUD UI for all 10 management pages

### Verification
- (Not verified in this session — historical entries)
