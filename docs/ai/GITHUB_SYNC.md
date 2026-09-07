# BizFlow — GitHub Synchronization and Commit Protocol

> GitHub is the single source of truth for BizFlow. A Coding AI hands off to the
> next Coding AI **through the repository**, never through a chat transcript.

---

## 1. Repository

| Field | Value |
|-------|-------|
| Repository | `https://github.com/ZinLinn254995/biz-flow` |
| Default branch | `main` |
| CI workflow | `.github/workflows/ai-verify.yml` |
| Source of truth | The pushed contents of `main` |

## 2. What "synchronized" means

A task is synchronized only when **all** of the following are on `main`:

1. Application source changes
2. Test changes
3. Updated `docs/ai/AI_STATE.json`
4. Updated `docs/ai/AI_HANDOFF.md` and `docs/ai/CURRENT_STATE.md`
5. Updated `docs/ai/NEXT_TASK_PROMPT.md` describing the **next** task
6. Appended `docs/ai/CHANGELOG.md` entry
7. Updated `docs/ai/ROADMAP.md` and `docs/ai/KNOWN_ISSUES.md` where affected

Partial pushes (code without state, or state without code) are forbidden. One
task = one coherent commit (or one PR) containing code **and** state.

## 3. Sync procedure

Run verification first — never push unverified work:

```bash
npm run verify        # typecheck + test + build + import check + AI state check
```

Then:

```bash
git status                       # confirm only intended files changed
git add -A
git commit -m "P2PXX: <short description> + AI state update"
git push origin main
```

Confirm the push actually landed:

```bash
git log --oneline -1
git status -sb                   # must show no ahead/behind divergence
```

If the push fails (auth, protected branch, network), the task is **NOT
synchronized**. Say so explicitly in the handoff report and record
`gitState.lastSyncedTask` as the last task that really landed.

## 4. Environments that cannot push

Some Coding AI environments have no direct git write access to this repository.
In that case:

1. Still complete every documentation and state update in the working tree.
2. State clearly in the final report: **"Changes are NOT pushed to GitHub."**
3. List every created / modified / deleted file so the human can commit them.
4. Give the human the exact commands from section 3.

**Never claim a push or sync happened unless it actually happened.**

## 5. Commit message convention

```
P2P19: atomic stock operations + AI state update
P2P20: dead code cleanup + AI state update
docs(ai): continuation system upgrade
```

Rules:
- One milestone per commit. Do not mix unrelated milestones.
- Never force-push, rebase, amend or squash commits that are already on `main`.
- Never commit `node_modules/`, `dist/`, or build timestamp artifacts.

## 6. Continuous verification on GitHub

`.github/workflows/ai-verify.yml` runs on every push and pull request to `main`:

| Job step | Command |
|----------|---------|
| Typecheck | `npm run typecheck` |
| Tests | `npm run test` |
| Production build | `npm run build` |
| Dangling imports | `npm run verify:imports` |
| AI state / docs consistency | `npm run verify:ai` |

CI runs on **Node 22**. Node 20 fails: the architecture constraint tests use
`node:fs` `globSync`, which only exists from Node 22. Use Node 22 locally too.

Last verified CI run: commit `f53b8b4` on `main` — **success**.

The workflow is **verification only**. It never modifies application source,
never commits, and never generates code. A red CI run means the last push is
not a valid handoff point: the next Coding AI must fix it before starting new
work.

## 7. Handoff acceptance test

Before finishing, ask: *if a brand-new Coding AI is given only this repository
URL, can it continue?* It can only if:

- `npm run verify` passes on a clean clone
- `docs/ai/AI_STATE.json` matches reality
- `docs/ai/NEXT_TASK_PROMPT.md` describes a real, unfinished task
- CI on `main` is green

If any answer is no, the handoff is incomplete.
