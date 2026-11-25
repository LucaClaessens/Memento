---
name: vertical-slice
description: Use when implementing a Memento GitHub issue (especially one labeled ready-for-agent, or a "work on issue #N" request) as a vertical slice: plan, grill the decisions, then build schema → database → API → web → tests → browser verification → PR.
---

# Vertical slice

A Memento ticket is a tracer bullet: one thin path through schema, database, API, and
UI that later tickets reuse. Ship it end to end before widening it.

## 1. Read the ticket

- `gh issue view <n> --json number,title,body,labels,comments`
- Read `GLOSSARY.md`, `docs/codebase-design.md`, and the relevant `docs/adr/`.
- Check the blockers listed in the issue; a blocked ticket waits.

Done when: you can state the acceptance criteria in your own words and name the files
the slice will touch.

## 2. Plan

Write a short plan before touching code. Cover:

- shared schema → database/migration → API route → web UI → tests;
- the API contract and the user-visible behavior;
- the files to add or change;
- the verification steps (commands and browser checks).

Save it where the next session can find it (an OpenChamber plan or a session context
file), and keep it updated as decisions land.

## 3. Grill

Invoke the `grilling` and `domain-modeling` skills. Work the design tree in rounds:
ask the whole frontier with a recommendation for each question, wait for answers, then
recompute. Update `GLOSSARY.md` the moment a term resolves. Amend an ADR only for a
hard-to-reverse, surprising trade-off.

Done when: every branch of the tree is settled and the user confirms shared
understanding. No code before this point.

## 4. Toolchain gate

From the repo root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

Done when: all four gates pass and `http://localhost:5173` renders. If the toolchain is
red, repair it in its own `fix(...)` PR before starting the slice.

## 5. Branch

```bash
git checkout main
git pull --ff-only
git checkout -b <type>/<issue>-<short-slug>
```

Types, scopes, commit format, and PR rules live in `CONTRIBUTING.md`.

## 6. Build the slice

Order: shared schema → database/migrations/repository → API app/routes → web
client/store/components → tests.

- `packages/shared` owns API shapes; never duplicate a shape in an app.
- Migrations are TypeScript modules in `apps/api/src/db/migrations/`, applied on
  startup.
- The API is built with `createApp({ db })` so tests can use an in-memory database.
- No business logic in Svelte components; put it in `$lib/api` and `$lib/stores`.
- For UI, read the vendored skill at
  `apps/web/.agents/skills/shadcn-svelte/SKILL.md` first.
- Run the affected package's typecheck and tests after each layer; fix before moving
  on.

Done when: the ticket's acceptance criteria pass locally and tests cover the new
contract.

## 7. Verify in the browser

- `pnpm dev` starts the API on `8787` and the web app on `5173`.
- Open `http://localhost:5173` in the OpenChamber browser panel, snapshot, and
  exercise the flow.
- Reload the page and confirm the data persists; restart the API and confirm it still
  persists.
- Check the failure path: an unreachable API or a validation error must leave the
  user's input intact.
- Capture a screenshot for the PR.

Done when: the user-visible behavior matches the ticket, not just the API.

## 8. Gates

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
```

Never use `--no-verify`; fix the hook or CI failure instead.

Done when: all five checks pass and the diff is formatted.

## 9. PR

- Title: Conventional Commits (`<type>(<scope>): <subject>`), issue reference in the
  body.
- Body: what changed, why, and how it was verified (commands plus browser evidence).
- Squash merge after checks are green; delete the branch.
- Tick the plan and link the PR.

Done when: merged to `main` and the plan reflects it.

## Definition of done

- [ ] Acceptance criteria met end to end.
- [ ] New behavior covered by tests (API integration + shared schema; web client where
      practical).
- [ ] `pnpm lint`, `typecheck`, `test`, `format:check`, `build` green.
- [ ] Browser verification captured.
- [ ] PR merged; `GLOSSARY.md` / ADR / plan updated if a decision or term changed.

## Guardrails

- No direct pushes to `main`.
- No scoring, streaks, goals, or dashboards (see the README non-goals).
- No new runtime dependency without a decision recorded in the plan.
- No secrets or personal data in logs or test fixtures.
