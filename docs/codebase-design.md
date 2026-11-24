# Codebase design

This document describes the intended structure and conventions of the Memento repository.
It is a design, not yet an implementation. See `GLOSSARY.md` for domain terms and
`docs/adr/` for the decisions behind the choices below.

## Purpose of the repo

A monorepo (see ADR-0002/0005 context) containing a SvelteKit PWA frontend and a Hono
backend, sharing types and validation schemas. v1 ships milestones 1 and 2 (capture +
people list, then weekly review). Everything else is deferred (see "Deferred").

## Directory layout

```
Memento/
├── apps/
│   ├── web/                  # SvelteKit PWA (TypeScript)
│   │   ├── src/
│   │   │   ├── routes/       # SvelteKit routes (capture, people, review, check-in)
│   │   │   ├── lib/          # components, stores, offline sync
│   │   │   └── app.html
│   │   ├── static/           # PWA manifest, icons, service worker assets
│   │   ├── package.json
│   │   └── svelte.config.js
│   └── api/                  # Hono backend (TypeScript), runs on the Mac Mini
│       ├── src/
│       │   ├── routes/       # HTTP routes (entries, people, checkins, review, sync)
│       │   ├── services/     # extraction, rules, digest generation
│       │   ├── db/           # SQLite + SQLCipher access, migrations
│       │   ├── ai/           # faster-whisper + Ollama adapters
│       │   ├── middleware/   # auth token slot, logging, error handling
│       │   └── index.ts      # server entry
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/               # zod schemas + TS types shared by web and api
│       ├── src/
│       │   ├── schemas/      # Entry, Person, Mention, CheckIn, Idea, Nudge
│       │   └── index.ts
│       └── package.json
├── docs/
│   ├── adr/                  # architecture decision records
│   └── codebase-design.md    # this file
├── .github/
│   └── workflows/
│       └── ci.yml            # typecheck + tests + build + lint
├── GLOSSARY.md
├── README.md
├── .gitignore
└── package.json              # workspace root (npm/pnpm workspaces)
```

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | SvelteKit | Fast solo iteration, PWA-friendly, TS-first |
| UI design system | Material 3 via `m3-svelte` (noph-ui as alternative) | Consistent M3 components; theming via CSS variables |
| Frontend language | TypeScript | Shared with backend |
| Backend framework | Hono | TS-first, minimal, portable (ADR-0002) |
| Backend language | TypeScript (Node) | Single stack (ADR-0002) |
| Validation/types | zod in `packages/shared` | One source of truth for API + client |
| Database | SQLite + SQLCipher | Single file, encrypted at rest (ADR-0003) |
| Transcription | faster-whisper (backend) | Local (ADR-0001) |
| LLM (extraction, digest) | Ollama (backend) | Local (ADR-0001) |
| Offline storage (phone) | IndexedDB | Offline-first capture (ADR-0004) |
| Network/auth | Tailscale + shared token | No accounts in v1 (ADR-0005) |
| Lint/format | ESLint + Prettier | Conventional, robust Svelte support |
| Tests | Vitest | Standard for Vite/SvelteKit; works for Hono |
| CI | GitHub Actions | Typecheck + tests + build + lint on push/PR to main |

## Data flow

1. **Capture (phone, offline-capable).** User records audio (or types). Entry is saved to
   IndexedDB with a client-generated id and `synced = false`. UI returns immediately.
2. **Sync.** When the backend is reachable (Tailscale), a background worker uploads
   unsynced Entries with idempotency keys, then marks them synced and stores the
   server canonical record.
3. **Transcription (backend, async).** Backend runs faster-whisper on the audio and stores
   `raw_text` on the Entry. Never on the capture path.
4. **Extraction (backend, async).** An Ollama prompt extracts people, dates, mentions
   into the reviewable inbox (suggested, non-blocking). User can correct/dismiss later.
5. **Rules (backend).** Deterministic rules over Check-ins/Entries may fire Nudges.
6. **Weekly review (backend, on demand).** Single Ollama prompt over the week's entries
   produces the one-page review.

## Auth slot

`apps/api/src/middleware/auth.ts` is a single middleware that validates the shared token
in v1 and is the only place that knows about auth. Replacing it with a real auth
solution later must not require touching route handlers.

## Offline sync contract

- Client-generated ids (UUID) are the source of truth for identity; server never
  reassigns.
- Uploads are idempotent by id; retries are safe.
- Sync state (`synced`, `synced_at`, last error) is visible in the UI.
- The phone may hold un-synced audio; total size should be bounded and surfaced.

## Database

- One SQLite file with SQLCipher, on the Mac Mini.
- Migrations live in `apps/api/src/db/migrations/` and run on startup.
- Complete delete = delete rows (and, for "delete all data", delete the DB file).
- Backups = copy the DB file (documented in README).

## Conventions

- Domain terms come from `GLOSSARY.md`; code identifiers should match glossary terms
  (Entry, Person, Mention, CheckIn, Idea, Nudge).
- Shared schemas in `packages/shared` are the only place API shapes are defined; both
  apps import from there.
- No business logic in Svelte components; keep it in stores/lib or the backend.
- Extraction and digest are async background jobs; capture and check-in endpoints
  return immediately.
- Never log confidential employer information; treat all content as sensitive.
- Output that leads to action is preferred over analysis; avoid dashboards/graphs.

## CI

`.github/workflows/ci.yml`: on push/PR to `main` — install, typecheck (web + api +
shared), lint, tests (Vitest), build (web). No deploy step; deploy to the Mac Mini is
manual.

## v1 scope and tickets

v1 = milestones 1 + 2 (capture + people list, then weekly review). Tracked as GitHub issues
#2–#8, each a tracer-bullet vertical slice with native blocking edges:

1. Text capture end-to-end (no blockers)
2. Voice capture with transcription (blocked by 1)
3. Offline capture and background sync (blocked by 1, 2)
4. People list with manual entry (blocked by 1)
5. Auto-extraction of people and mentions (blocked by 1, 4)
6. Reach-out suggestion with draft message (blocked by 4, 5)
7. Weekly review generation (blocked by 1)

Clinical-facing export and crisis handling are out of scope for now (see Deferred).

## Deferred (not in v1)

- Early-warning check-ins (milestone 3)
- Parking lot (milestone 4)
- Clinician export (milestone 4)
- Crisis-resource handling
- Native (Capacitor) wrapper
- User accounts / multi-user
- Any ML beyond whisper + Ollama prompts
