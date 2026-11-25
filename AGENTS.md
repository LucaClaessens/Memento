# Agent Guidelines

- Never use `git commit --no-verify` or `git push --no-verify`. Always run the pre-commit hooks (lint, typecheck, tests) and fix any failures before committing.
- Do not bypass CI checks. If a hook or check fails, fix the underlying issue rather than skipping it.

## Workflow

For a `ready-for-agent` issue, a "work on issue #N" request, or any feature ticket, follow
`.opencode/skills/vertical-slice/SKILL.md`: plan → grill → toolchain gate → branch →
schema/database/API/web/tests → dev servers → browser verification → gates → PR.
