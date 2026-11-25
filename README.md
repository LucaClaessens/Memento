# Memento

Personal support tool (working title). See `docs/codebase-design.md` for structure,
`GLOSSARY.md` for domain terms, and `docs/adr/` for decisions.

Status: v1 in progress. Text capture works end to end (#2); see the open issues for the
rest.

## Run locally

```bash
pnpm install
pnpm dev
```

- API: `http://localhost:8787` (health: `/health`, entries: `/entries`)
- Web: `http://localhost:5173`
- Database: `apps/api/data/memento.db` (override with `MEMENTO_DB_PATH`; loaded from
  `apps/api/.env` when present)
- Set `PUBLIC_API_URL` in `apps/web/.env` if the API is not on `http://localhost:8787`

## Quick orientation

- `apps/web` — SvelteKit PWA (TypeScript)
- `apps/api` — Hono backend (TypeScript), runs on the Mac Mini
- `packages/shared` — zod schemas + types shared by both
- `docs/` — design + ADRs

## Contributing

See `CONTRIBUTING.md` for the development workflow (branching, commits, releases, hooks).

## License

MIT — see `LICENSE`.

## Non-goals

Not a productivity/optimization system. No scoring, streaks, goals, or pressure. No
dashboards of graphs. Not a diagnostic tool. Logging always optional.

## Privacy

Health-adjacent personal data, treated as sensitive. All processing local (Mac Mini +
Tailscale). Nothing leaves the local network. See ADR-0001.
