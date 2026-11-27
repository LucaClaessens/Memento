# Agent Guidelines

- Never use `git commit --no-verify` or `git push --no-verify`. Always run the pre-commit hooks (lint, typecheck, tests) and fix any failures before committing.
- Do not bypass CI checks. If a hook or check fails, fix the underlying issue rather than skipping it.
- Never merge a pull request without asking the user. Open it, report the verification, and
  wait; the user merges feature slices after reviewing the outcome.

## Skills and context

Load these when they match the change (their `description` says when). Matt Pocock skills
live in `~/.config/opencode/skills/` and are available in every session.

- `vertical-slice` — end-to-end ticket work (plan → grill → build → verify → PR).
- `memento-change-discipline` — smallest complete change, proof, review findings, validation matrix.
- `test-design` — what earns a test, factory patterns, no module mocks / no source-text assertions.
- `communication-style` — replies, docs, UI copy, PR/issue comments (Memento glossary discipline).
- `codebase-design` (Matt Pocock) — module/interface/depth/seam vocabulary; deletion test.
- `grilling` / `grill-with-docs` (Matt Pocock) — decision trees; settle decisions before code.
- `tdd` (Matt Pocock) — red-green-refactor.
- `domain-modeling` (Matt Pocock) — GLOSSARY.md terms and ADRs.
- `improve-codebase-architecture` (Matt Pocock) — deepening opportunities.
- `to-spec` / `to-tickets` (Matt Pocock) — spec and ticket breakdown.

Always read `GLOSSARY.md`, `docs/codebase-design.md`, and relevant `docs/adr/` before
editing. Modules with a contract or non-obvious design choice carry a `DOCUMENTATION.md`
(ownership / invariants / decisions) — see `docs/codebase-design.md`.

## Workflow

For a `ready-for-agent` issue, a "work on issue #N" request, or any feature ticket, follow
`.opencode/skills/vertical-slice/SKILL.md`: plan → grill → toolchain gate → branch →
schema/database/API/web/tests → dev servers → browser verification → gates → PR.
