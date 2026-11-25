# Contributing to Memento

This document describes the development workflow agreed for the Memento monorepo.
It is the source of truth for how changes are proposed, reviewed, committed, and released.
See `docs/codebase-design.md` for repository structure and `GLOSSARY.md` for domain terms.

## Branching model (trunk-based)

- `main` is the only long-lived branch and is always releasable.
- All work happens on short-lived feature branches cut from the latest `main`.
- Branch names follow `<type>/<issue-number>-<short-slug>`, e.g. `feat/2-text-capture`,
  `fix/14-sync-retry`. `<type>` is a Conventional Commits type (see below).
- Keep branches short-lived; merge within a few days. Long-running branches are a smell.

## Pull requests

- Every change reaches `main` through a pull request. Direct pushes to `main` are not allowed.
- A PR must be up to date with `main` before merge.
- Required CI checks must be green before merge: typecheck, lint, `prettier --check`,
  test, build, and the PR-title commitlint check.
- There are no required human reviewers (solo maintainer). Feature slices are reviewed
  and merged by the maintainer: an agent must open the PR, report verification, and ask
  before merging. Agents merge only when the maintainer explicitly asks.
- Merge using **squash merge** only. The PR title becomes the single commit on `main`,
  so the PR title must be a valid Conventional Commits message (see below).
- Delete the branch after merge (enabled automatically).

## Commit conventions (Conventional Commits)

All commits and PR titles must follow Conventional Commits:

```
<type>(<scope>): <subject>
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
  `chore`, `revert`.
- **Scopes** (fixed enum): `web`, `api`, `shared`, `root`, `docs`, `ci`, `config`, `deps`.
  Omit the scope only when the change is genuinely cross-cutting.
- **Subject**: imperative mood, lowercase, no trailing period, max 72 characters.
- **Breaking changes**: append `!` after the type/scope, e.g. `feat(api)!: ...`, and
  explain in the body. A breaking change bumps the major version.
- Body and footer are optional but encouraged for non-trivial changes.

Examples:

```
feat(web): add offline capture queue
fix(api): handle missing audio file on transcription
docs(root): document dev workflow
chore(deps): bump svelte to 5.1.0
```

Enforcement:

- Locally: the `commit-msg` Husky hook runs `commitlint`.
- In CI: the PR title is validated (it becomes the squash commit).

## Versioning and releases (release-please)

- The product uses Semantic Versioning, driven by Conventional Commits via `release-please`.
- All packages share one version (fixed versioning): `apps/web`, `apps/api`,
  `packages/shared`, and the root.
- Starting version is `0.0.0`. `release-please` opens a release PR on `main` that bumps
  versions and updates `CHANGELOG.md`; merging it creates the git tag and GitHub release.
- Bump rules: `feat` → minor, `fix` → patch, breaking (`!`) → major.
- `1.0.0` is reserved for the first complete v1 (milestones 1 + 2).
- Do not edit version numbers or `CHANGELOG.md` by hand; let `release-please` do it.

## Local development and hooks

Hooks are fast by design; CI is the gate.

- `pre-commit`: runs `lint-staged` — Prettier (write) on all staged files, ESLint
  (`--fix`) on staged `*.ts`/`*.svelte`/`*.js`.
- `commit-msg`: runs `commitlint` on the commit message.
- There is no `pre-push` hook. Run `pnpm typecheck` and `pnpm test` locally before
  pushing if you want early feedback; CI runs them regardless.

Install hooks after cloning:

```bash
pnpm install   # runs the `prepare` script (Husky)
```

## Code style

- Formatting: Prettier (config in `.prettierrc`). Run `pnpm format` to format,
  `pnpm format:check` to verify.
- Linting: ESLint (root `eslint.config.js`). Run `pnpm lint`.
- Type checking: `pnpm typecheck`.
- Tests: Vitest. Run `pnpm test`.

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`: install, typecheck, lint,
`prettier --check`, test, build. Additional checks (commitlint on PR title, Dependabot)
are configured separately. Deploy to the Mac Mini remains manual (see README).

## Dependencies

Versions are pinned to exact values in `package.json` (`save-exact=true` in `.npmrc`).
Do not introduce `^`/`~` ranges; let Dependabot or a deliberate PR change versions.
The package manager (pnpm) is pinned via the `packageManager` field.

## Issues and pull requests

- Use the provided issue templates for bugs and feature requests.
- Reference the issue number in the branch name and PR title where applicable.
- Keep PRs focused: one logical change per PR.

## License

The project is released under the MIT license (see `LICENSE`).
