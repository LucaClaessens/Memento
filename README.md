# Memento

Personal support tool (working title). See `docs/codebase-design.md` for structure,
`GLOSSARY.md` for domain terms, and `docs/adr/` for decisions.

Status: idea stage → v1 (milestones 1 + 2). Not yet implemented.

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
