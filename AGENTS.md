# Agent Guidelines

- Never use `git commit --no-verify` or `git push --no-verify`. Always run the pre-commit hooks (lint, typecheck, tests) and fix any failures before committing.
- Do not bypass CI checks. If a hook or check fails, fix the underlying issue rather than skipping it.
- Never merge a pull request without asking the user. Open it, report the verification, and
  wait; the user merges feature slices after reviewing the outcome.

## Workflow

For a `ready-for-agent` issue, a "work on issue #N" request, or any feature ticket, follow
`.opencode/skills/vertical-slice/SKILL.md`: plan → grill → toolchain gate → branch →
schema/database/API/web/tests → dev servers → browser verification → gates → PR.
