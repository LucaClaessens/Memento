---
name: memento-change-discipline
description: Use when implementing, fixing, refactoring, or otherwise modifying Memento source code, shared schemas, database migrations, API routes, web UI, or build configuration. Load alongside the vertical-slice skill for ticket work.
---

# Memento change discipline

Memento is a small monorepo (SvelteKit PWA + Hono API + shared zod schemas + SQLite).
These rules keep changes small, provable, and compatible with the Matt Pocock skills
this repo uses (`grilling`, `codebase-design`, `tdd`, `domain-modeling`,
`improve-codebase-architecture`).

## Core principle

Make the smallest complete change and validate at the narrowest level that covers the
real risk. A migration or port keeps product behavior identical: diff behavior, not
types.

## Before editing

1. State the behavior you are changing in one sentence a user or caller would use.
2. Name the files and the layer(s) touched (shared schema, db, api, web, tests).
3. If a decision is unclear, grill it (`grilling`) before coding; product decisions
   belong to the user and are settled before the code, never inside the diff.

## Structural discipline

- Preserve behavior established by callers and tests unless the request replaces it.
  Keep the diff scoped to the complete requested behavior.
- Make the normal use-case path read top to bottom in domain terms. Keep orchestration
  entrypoints thin; move mechanics behind focused, intention-revealing boundaries.
- Prefer explicit dependencies and dependency injection over hidden module coupling.
  Pass dependencies as arguments/props so tests can hand over small fakes; the project's
  own modules run for real. See `test-design`.
- Follow local TypeScript types; avoid `any`, blind casts, and guessed payload shapes.
- Reject invalid inputs and broken preconditions early so the valid path stays flat.
- Require evidence before adding retries, caches, compatibility paths, or generalized
  race handling. Security, data-loss, destructive-operation, and concurrency
  invariants still require proactive design when the risk is inherent.
- Pull complexity downward only when a boundary hides meaningful mechanics, owns an
  invariant, isolates a proven integration, or captures stable repetition. Do not
  spread obvious code across pass-through layers.

## Proof

A test is proof when it is deterministic and fails without the change. Behavior that
lives in a runtime is proven by running that runtime and watching the scenario.

1. Reproduce first (or observe current behavior for a feature).
2. Fix the cause: the smallest change that removes it.
3. Prove it: run the reproduction and watch it pass.
4. Second look: review the diff (code-review skill or another model) for non-trivial
   changes; one-line and text-only edits go without.
5. Hand off: working tree or PR; never merge without the user's go-ahead.

Pick scenarios before counting them: first the plain path a user takes end to end, then
the ordinary breaks (server down, cancelled sign-in, empty/slow answer). Rare races and
exotic inputs earn coverage only with a concrete reason.

## Module documentation

A module that owns a contract other code relies on, an invariant, or a non-obvious
design choice carries a `DOCUMENTATION.md` in its folder with three parts:

- **Ownership**: what the module owns and where its boundary is.
- **Invariants**: what must stay true, stated so a change can be checked against it.
- **Decisions**: one `### Why X and not Y` entry per non-obvious choice (chosen approach,
  alternative, reason in one or two sentences).

Describe the module as it is now; when a decision changes, rewrite its entry. Spend the
file's lines on reasons and contracts, not file listings. See `docs/codebase-design.md`.

Use the Matt Pocock vocabulary from `codebase-design` (module, interface, depth, seam,
adapter, leverage, locality) when discussing architecture; use `GLOSSARY.md` terms for
domain language. Deepening opportunities are found with `improve-codebase-architecture`.

## Answering review findings

When a reviewer (subagent, bot, or person) reports on your change, you own the change
and the reviewer advises.

- Weigh every finding yourself before acting. A problem the change neither causes nor
  set out to fix is a nit, whatever label it came with. A regression this change
  introduces is never a nit.
- Fix what is wrong in the case the change is for, with the smallest fix. A fix that
  deletes or narrows code beats a new guard, helper, option, or test the goal does
  not need.
- A finding you think is wrong stays unfixed, with evidence (file and line, test,
  command output). Decline nits and out-of-scope items in one line each; a real
  problem outside the change goes to the report as a follow-up.
- Never agree with a finding just to end the review.
- A finding still disputed after two rounds each goes to the user, with both
  positions in two or three lines. Do not argue a third round.
- After the fixes, compare diff size with before review. If review grew it, cut first.

## Validation matrix

| Change                             | Minimum validation                                                        |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Executable source (api/web/shared) | Proof of changed behavior; typecheck + lint come from the pre-commit gate |
| Shared schema / zod contract       | Typecheck consumers (web + api) + tests                                   |
| Database migration or repository   | Repository tests against `:memory:` SQLite + migration tests              |
| API route                          | Route tests + typecheck                                                   |
| Web UI / component                 | Run it (`pnpm dev:web` / `pnpm dev:api`) and look; browser check          |
| Persisted or external contract     | Compatibility/round-trip tests                                            |
| Dependency or lockfile             | Workspace-wide checks + affected builds                                   |
| Generated asset                    | Regeneration check + consumer build/test                                  |

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check`, `pnpm build`
before claiming done (see AGENTS.md). TypeScript and lint do not cover server JS or
native code: run `node --check` or focused tests for those.

## Refactoring under a behavior net

A split, move, or rewrite keeps behavior identical. Establish current behavior before
changing structure: run the relevant tests on the unchanged code (all green) first. A
red scenario on untouched code is a finding to report before refactoring. After the
change, rerun the same tests. Edit a test only when it was tied to structure; rewrite
it to check the result.

## Compatibility with Matt Pocock skills

- Decisions and trade-offs: `grilling` / `grill-with-docs`.
- TDD workflow and red-green-refactor: `tdd`.
- Architecture vocabulary and deepening: `codebase-design`, `improve-codebase-architecture`.
- Domain terms and ADRs: `domain-modeling`, `GLOSSARY.md`, `docs/adr/`.
- Ticket breakdown: `to-tickets`, `to-spec`.
- Agent context discovery: `contextscout` (core subagent).

This skill owns Memento-specific change discipline; it defers to those skills for
their topics rather than duplicating them.
