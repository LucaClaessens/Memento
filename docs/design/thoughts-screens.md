# Design: whiteboard landing and recent thoughts screens

Design spike for GitHub issue #36. No production code ships with this note. It settles
the two-screen thought flow that replaces the current capture-and-list home page, the
thread data model, and the title/summary prompt. Follow-up implementation is tracked in
separate vertical-slice issues (see section 9).

## 1. Purpose and scope

Memento's capture surface today is a form plus a flat list on one page. This design
replaces it with two focused screens:

1. **Landing — writing surface.** A distraction-free, full-screen writing surface.
2. **Recent thoughts.** A reverse-chronological list of per-entry cards (title +
   one-line summary), opening into a thought detail that keeps the original capture
   immutable and lets the user deepen it through a thread of follow-up entries.

Out of scope (non-goals): voice recording/transcription (#3), AI titles/summaries
implementation (#6/#8 groundwork), offline sync (#4), drafts/auto-save, search, topic
clustering, spatial canvas. See issue #36.

## 2. Settled decisions (do not reopen)

- Full-screen writing surface, not a spatial canvas; the reference is layout
  inspiration only.
- No prompt generation in this iteration; leave room for a prompt slot.
- Per-entry cards with title + summary — not topic clusters or a combined digest.
- Deepening = a thread of follow-up entries; the original capture is never edited.
- AI is designed now, implemented later; the first slice uses the first line as the
  title and shows no summary.
- UI says "Thoughts"; domain and code stay "Entry" (see GLOSSARY.md).
- The whiteboard landing lands before voice capture (#3), so #3 adds the record
  control to the new surface.

## 3. Information architecture

Routes (SvelteKit):

- `/` — Landing (writing surface). Default route and home.
- `/thoughts` — Recent thoughts list.
- `/thoughts/[id]` — Thought detail + thread.

Navigation is deliberately minimal: a thin top bar with the app mark and a "Thoughts"
link on the landing; a "← Thoughts" back link and a "Write" link on detail. No sidebar,
no dashboard. Mobile-first; the top bar collapses to app mark + single link.

Capture keeps today's Entry API and store behavior: explicit send (button) and
Cmd/Ctrl+Enter, text preserved exactly (no trimming), client-generated id and
timestamp (ADR-0004).

## 4. Landing — writing surface

### 4.1 Layout, phone

- Full viewport height (`100dvh`), no page scroll; the textarea is the scroll
  container.
- Top bar: app mark (left) + "Thoughts" link (right). ~48px.
- Body: a single `<textarea>` filling all remaining space, font-size 1.125rem,
  line-height 1.6, no border, transparent background, padding 1.25rem.
- Placeholder: "What's on your mind?" in muted color. (Placeholder is hint only; the
  field carries an `aria-label`.)
- Bottom toolbar (~56px): left reserved record slot (hidden until #3, 40px reserved
  to avoid shift), center a muted hint "⌘↵ to save", right "Capture" button. A prompt
  slot sits above the textarea (section 4.4).

### 4.2 Layout, desktop

Same structure, content column capped at 720px and centered, top bar full width. The
textarea and toolbar align to the column. Font-size 1.125rem. No multi-column.

### 4.3 Behavior

- Submit via button or Cmd/Ctrl+Enter. Disabled when empty/over limit/submitting.
- On success: clear the textarea, move focus back to it, announce "Saved." in an
  `aria-live` region; optionally show "Saved — view in Thoughts". Text is never
  trimmed; max 10,000 chars with a counter near the limit.
- On error: keep text intact, show an alert, re-enable submit (mirrors today's
  store behavior).
- No auto-save or drafts (non-goal).

### 4.4 Reserved slots

- **Prompt slot** (above the textarea): a region with `min-height: 0` that is
  `aria-hidden` and visually empty in v1. Future prompt work (#6/#8) renders a short
  question here without layout shift beyond its own content. When empty it contributes
  zero height.
- **Record control slot** (left of send in the toolbar): a 40px reserved gap that #3
  fills with a record button. Reserving avoids a shift when voice capture lands.

### 4.5 States

- Empty (no text): placeholder visible, submit disabled.
- Typing: submit enabled.
- Submitting: spinner in button, textarea disabled to prevent double submit.
- Error: alert shown, text retained.
- Long text: textarea scrolls internally; counter warns near 10,000.
- First use: the footer hint "⌘↵ to save" plus placeholder suffice; no separate
  onboarding modal.

### 4.6 Accessibility

- `<textarea aria-label="Capture a thought">`; placeholder is not the accessible name.
- Submit is a real `<button type="submit">`; Cmd/Ctrl+Enter handled via keydown.
- Focus returns to the textarea after a successful capture.
- Saved/error status in `aria-live="polite"`.
- No color-only signaling; contrast meets WCAG AA on both themes.
- Respect `prefers-reduced-motion` (spinner is the only motion).

## 5. Recent thoughts

### 5.1 Layout, phone

- Top bar: "Thoughts" title (left) + "Write" link (right).
- Vertical list of cards, full width with 1rem horizontal padding, gap 0.75rem.
- Each card: title (semibold, one line, ellipsis), optional summary (muted, one
  line, ellipsis), timestamp (xs, muted). Whole card is a link/button.

### 5.2 Layout, desktop

Same list capped at 720px and centered. Single column for readable line lengths. (Two
columns were considered and rejected: titles/summaries vary in length and a grid makes
scanning harder.)

### 5.3 States

- Empty: "No thoughts yet." + "Write one →" link to `/`.
- Loading: "Loading…" or skeleton cards; announced.
- Error: alert with retry.
- Long text: title and summary clamped to one line in the card; full text on detail.
- First use: same as empty.

### 5.4 Detail / thread

Route `/thoughts/[id]`.

- Top: "← Thoughts" back link.
- Header card: title (if present) + summary (if present) + timestamp. Title falls
  back to the first line when no AI title exists (slice b).
- Body: the original entry's `rawText` rendered with `white-space: pre-wrap`, never
  edited. This is the immutable source.
- Thread: follow-up entries (children) in chronological order (oldest first), each as
  a smaller card with rawText + timestamp. Header "Thread".
- Composer at the bottom: textarea placeholder "Add a follow-up…", Cmd/Ctrl+Enter,
  "Add" button. On success the new entry appears in the thread and the composer
  clears; the original is untouched.
- Empty thread: "No follow-ups yet."

Detail states: loading, error, not-found (alert + back link).

### 5.5 Accessibility

- Cards are `<a>`/`<button>` with a single accessible name (title + summary).
- Thread order is chronological in the DOM; timestamps are `<time>`.
- Composer reuses the landing's keyboard and focus rules.
- Back link is the first focusable element.

## 6. Data model

### 6.1 Threads

Add a self-referential foreign key on `entries`:

- `entries.parent_id TEXT NULL REFERENCES entries(id) ON DELETE SET NULL`
- `NULL` means a root entry. The list shows roots only.
- Index `entries_parent_id` on `parent_id`.

Follow-ups are ordinary entries with `parent_id` set; they are captured through the
same API with an optional `parentId`. Deepening never mutates `rawText` of any entry.

### 6.2 Titles and summaries

Derived, never part of `rawText`:

- `entries.title TEXT NULL`
- `entries.summary TEXT NULL`
- (optional) `entries.title_source TEXT CHECK (title_source IN ('first_line','ai'))`

Titles/summaries are regenerable projections; `rawText` stays the source of truth.
Slice b populates `title` synchronously with the first-line fallback; slice c refines
via Ollama and sets `title_source = 'ai'`.

### 6.3 Migration shape

New migration module `apps/api/src/db/migrations/002-entries-threads-and-titles.ts`,
registered in the migrations index. Because SQLite supports `ALTER TABLE ... ADD COLUMN`,
no table rebuild is needed:

    ALTER TABLE entries ADD COLUMN parent_id TEXT REFERENCES entries(id) ON DELETE SET NULL;
    ALTER TABLE entries ADD COLUMN title TEXT;
    ALTER TABLE entries ADD COLUMN summary TEXT;
    -- optional:
    ALTER TABLE entries ADD COLUMN title_source TEXT CHECK (title_source IN ('first_line','ai'));
    CREATE INDEX entries_parent_id ON entries(parent_id);

Backfill (run in the migration's TS `up`, iterating rows) sets `title` to the
first-line fallback for existing rows and leaves `summary` NULL. Foreign keys are
enforced only if `PRAGMA foreign_keys = ON`; the migration should not require it for
the nullable column.

Shared schema (`packages/shared/src/schemas/entry.ts`) changes in the implementing
slice: `EntrySchema` gains `parentId`, `title`, `summary` (and optional
`titleSource`); `CreateEntrySchema` gains optional `parentId`.

### 6.4 API changes (implementing slices)

- `GET /entries` accepts an optional `parentId` query param. Absent/null → roots only
  (default). Present → children of that entry.
- `GET /entries/:id` returns a single entry.
- `POST /entries` accepts optional `parentId` (validated: parent must exist).
- Validation rejects self-parenting and unknown parents (400/404).

### 6.5 Listing semantics change

Today `GET /entries` returns all entries. After migration all existing entries are
roots (parent_id NULL), so the default still returns them; only follow-ups are hidden
from the root list. No data loss.

## 7. AI titles and summaries (design only)

### 7.1 Prompt sketch (local Ollama only)

System prompt:

> You extract a short title and a one-line summary from a personal journal entry.
> Reply with JSON only: {"title": string, "summary": string | null}.
> Title: at most 6 words, no quotes, no trailing period.
> Summary: at most one sentence, at most 20 words, factual, no speculation.
> If the entry is too short to summarize, set summary to null.
> Never invent people, places, or events not present in the entry.

User prompt:

> Entry:
> {rawText}

Parse the JSON; on parse failure or timeout, fall back to section 7.2. Run as an async
background job after the entry is stored (never on the capture path), mirroring
extraction (#6).

### 7.2 Deterministic fallback

- Title = first non-empty line of `rawText`, trimmed, truncated to 80 characters.
  If there is no non-empty line, title = "Untitled thought".
- Summary = null (no summary in slice b; slice c may keep null on failure).

### 7.3 Privacy note

Inference runs only on the local Ollama instance on the Mac Mini (ADR-0001). No entry
text, title, or summary leaves the local network; the phone talks only to the Mac Mini
over Tailscale. Titles/summaries are stored in the same SQLite file as entries. No
hosted LLM API is used.

## 8. Non-goals

Voice recording/transcription (#3), implementing AI (#6/#8), offline sync (#4),
drafts/auto-save, search, topic clustering, spatial canvas, pagination beyond the
existing limit, deletion.

## 9. Follow-up issues

Three vertical slices, each with its own PR. Each is blocked by this design (#36).

1. **Whiteboard landing** — #37: replace the home page with the writing surface;
   keep the capture API. Blocked by: #36 (and #2 done).
2. **Recent thoughts list + detail/thread** — #38: migration, API, UI for roots +
   thread. Blocked by: #36 (and #37 recommended).
3. **AI titles/summaries** — #39: Ollama title/summary with first-line fallback.
   Blocked by: #6, #8, #36, #38.

## 10. Design references

Inspiration captured in the project notes (Mobbin):

- stoic. iOS whiteboard writing screen —
  https://mobbin.com/screens/7ca002c6-731c-4b77-bcc2-44420d5eab8a
  (full-screen, distraction-free writing surface; basis for the landing).
- stoic. iOS app screens —
  https://mobbin.com/apps/stoic-ios-621f0be7-8046-45cd-b667-97add5f9c3c7/fd166e24-39ab-43ac-96ad-1095935c93fe/screens
- co-star iOS screens —
  https://mobbin.com/apps/co-star-ios-9a62804f-6b1b-4423-8b2d-5ad8508a8b52/059f5811-93ff-47d0-b033-b55be51a020e/screens

The landing reuses the stoic whiteboard's full-screen writing posture; the recent
thoughts list and detail/thread are Memento-specific and not derived from a single
reference.

## 11. Mockup lifecycle

The HTML mockups under `docs/design/mockups/` are temporary scaffolding for this design
spike. Remove that directory once the corresponding follow-up slice ships (#37 for the
landing, #38 for recent thoughts). Track cleanup in those issues.

## 12. Open questions

None blocking. Nav placement (top bar) and single-column desktop list are settled
here; revisit only if browser verification shows a problem.
