# Agent Guidelines

- Never use `git commit --no-verify` or `git push --no-verify`. Always run the pre-commit hooks (lint, typecheck, tests) and fix any failures before committing.
- Do not bypass CI checks. If a hook or check fails, fix the underlying issue rather than skipping it.
