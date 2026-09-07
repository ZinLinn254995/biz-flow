# BizFlow — Quality Gate Checklist

> Before declaring any task complete, verify every item below. An AI must NOT claim "complete" if any required check fails.

---

## Mandatory Checks

- [ ] **Scope respected** — Only the approved task was implemented. No unrelated files changed.
- [ ] **No unrelated files changed** — Verify with `git diff` (or file comparison if not a git repo)
- [ ] **Architecture constraints respected** — UI does not import repositories/services/Dexie. Hooks use ServiceProvider. Services depend on interfaces.
- [ ] **No unauthorized dependencies** — No new packages added to `package.json` unless explicitly required
- [ ] **No unauthorized network behavior** — No `fetch`, `axios`, `supabase`, or network calls introduced
- [ ] **Money rules respected** — All monetary values use integer minor units. No floating-point for storage or calculation.
- [ ] **Inventory rules respected** — Stock deduction/restoration logic preserved. Insufficient stock rejected.
- [ ] **Existing tests still pass** — `npm run test` shows 0 failures
- [ ] **New behavior has tests** — Any new functionality is covered by new or updated tests
- [ ] **TypeScript passes** — `npm run typecheck` exits 0
- [ ] **Production build passes** — `npm run build` exits 0
- [ ] **No obvious dead code introduced** — No orphaned imports, unused variables, or unused files
- [ ] **Documentation updated** — AI handoff docs updated where the completed work requires changes
- [ ] **Handoff generated** — Final handoff report produced using `docs/ai/HANDOFF_TEMPLATE.md`
- [ ] **Next task identified** — Next recommended task documented in handoff

---

## Verification Commands

```bash
npm run typecheck
npm run test
npm run build
```

All three must exit with code 0.

## Architecture Constraint Tests

```bash
npx vitest run src/test/hooks/*UiConstraints.test.ts src/test/hooks/hookConstraints.test.ts src/test/hooks/serviceConstraints.test.ts src/test/offlineVerification.test.ts
```

These must all pass. They enforce the layer boundaries that keep the architecture clean.

---

## Failure Handling

If any check fails:
1. Do NOT declare the task complete
2. Fix the failure
3. Re-run all checks
4. If the failure cannot be fixed, report it in the handoff and mark the task as incomplete

If you discover a discrepancy between documentation and code:
1. Report it in the handoff
2. Update the documentation to match the actual code
3. Do not claim the documentation was correct if the code contradicts it
