---
name: memento-ui-guidance
description: Use when designing, building, or reviewing Memento web UI: composing a screen, card, list row, or control; choosing surfaces, depth, borders, spacing, sizing, text density; motion and transitions; or how something looks and behaves. Covers Memento's own visual language, motion/continuity contract, and phone rules.
---

# Memento UI guidance

Memento's visual language and the interaction patterns expected without having to say
them. Tokens and concrete examples live in
`references/tokens-and-examples.md`. Mechanics of components live in shadcn-svelte
and Tailwind; this skill decides _what_ a screen should look and feel like.

How something looks and behaves is the maintainer's decision. Build to these patterns;
when a change needs a pattern this skill does not cover or would bend one, raise it as
a product question before building (root `AGENTS.md`).

## Depth: controls stand up, layout lies flat

The app has one rule for depth:

- **Controls are raised.** Anything you press or type into (buttons, dropdown triggers,
  chosen option of a segmented choice, text fields, the composer) carries an edge, a
  lit top line, and a short shadow. In light themes a field is pressed in (a place to
  type); in dark themes fields, buttons and pickers share one light.
- **Layout is flat and set off by tone.** Cards, list tiles, groups and panels have no
  border; each is a tone step from what it sits on. A block inside a tile is the next
  step. Never box a box: no card inside a card, no bordered row inside a bordered list.
- **A line means something.** Draw one only where it carries meaning: a section
  divider, a dashed empty slot ("Add …"), a drop target while dragging, the frame of a
  large canvas (editors, diffs) that would otherwise merge with the page.
- **Status speaks through fill.** A banner or error box is a tinted fill with no border;
  the fill already says warning, error or info.
- **Focus draws no ring.** A focused control takes the hover fill; a focused field
  brightens its own edge.

Memento uses shadcn-svelte tokens (`border`, `ring`, `shadow-*`, `bg-card`, `bg-muted`).
Prefer tone steps (`bg-background` → `bg-muted` → `bg-card`) over borders for layout.

## Quiet at rest

A screen at rest shows what the user reads and what needs them; the rest waits for a
hover, a menu, or a shortcut.

- **Colour carries state, and only state.** Use the state tokens (info/success/warning/error)
  for status. Everything that is not a state (a pin, a picked effort, a label) is muted
  or plain text. One state per spot.
- **Two tints are Memento's voice, and stay.** The user's own capture bubble carries a
  warm tint + faint ring (marks the user's words). Inline code in prose keeps its own
  hue, kept apart from state colours.
- **Rarely used actions go in a menu, last in the row.** A row of icons that say nothing
  without hover becomes the few everyday controls plus one "More" (`···`) at the end.
- **Metadata at rest is what the user scans.** A thought row reads date + title (+ optional
  one-line summary); details that only answer a question live in a tooltip.
- **Captions are bare words with room above.** A section caption (Thoughts, Thread, etc.)
  is a muted word at row size, no icon, with the widest gap above it.
- **One icon size per row.** Glyphs side by side share a size.

## Stability: interaction moves only what it touches

- **Reveal in place.** An option that reveals more shows it where the layout already has
  room, or in space the container reserves. Choosing between options swaps content of the
  same height, or reserves the tallest variant.
- **Status lines have a reserved slot.** A control whose state can produce a message keeps
  one line for it under the control, present even when empty.
- **Grow away from the user's focus.** A row a mode adds goes above the input, so the
  field the user types into stays put.
- **States keep their size.** Selected/hover/active/loading change colour and fill, never
  width, weight-driven reflow, padding, or borders that appear from nothing. A button
  showing a spinner keeps its width.
- **Collapse and expand** move only what is below them; the clicked header stays under
  the pointer.
- **A changing width eases.** A picker whose value changes width eases into it (morph).
  A mark arriving after a choice goes after the label, so the label never shifts.
- **An open popup eases into a new height** (menu/picker list narrowing as the user types).
- **Scrollers reserve their thumb.** Overlay scrollers keep a 6px gutter whether or not
  they overflow.
- **Popups open where they fit.** Dropdowns/selects/menus open toward the side with room.

## Composition

- **Icons sit in the line they label.** A decorative/kind icon goes inline at the start
  of the title, the size of its text; secondary lines start under the icon at the row's
  edge. Never a separate leading column with title/subtitle stacked beside it.
- **One row, one line where it fits.** Question every piece of metadata before showing it.
  What earns its place joins on one line with `·`, never a stacked subtitle + meta line.
  Truncate a long value with the full text in a tooltip rather than wrapping a list row.
- **Group by space before lines.** Related things sit close, unrelated things apart; a
  divider is the last resort.

## Text and density

- **Few words.** A label names the thing; a description adds only what the label doesn't
  say. Explanations go behind an info hint; warnings/status stay visible.
- **Readable secondary text.** Secondary text is `text-muted-foreground` at full strength,
  never a fraction (`/50`, `/70`): every theme keeps the muted colour at 4.5:1, and an
  opacity on top drops below. A quieter step between body and muted mixes the two
  (an `oc-title-rest`-style class) instead of opacity. Only text nobody needs to read may
  fade: separators (`·`, `/`), disabled controls, empty-state illustrations.
  Never muted text on a muted fill.
- **Activity rows: muted name, bright argument.** (For transcript-style lists.) Name muted
  at regular weight incl. icon; detail foreground when it's something scanned/acted on,
  muted when it's prose.
- **Dense, not cramped.** Rows compact; tap targets meet the mobile touch floor (44px
  rows, 36px other controls); text never below the typography scale for density.

## The phone (Memento is mobile-first PWA)

- **Top bar.** Reuse one header class across screens: 56px tall, 40px round buttons
  centred 28px from the edge, title starting at 60px. Back = `arrow-left`, close = `close`.
- **Touch sizes.** List rows 44px (`min-h-11`), other touch controls ≥ 36px.
- **What opens.** Picking a value or searching opens a bottom sheet (flat rows, fill +
  check on selected, uppercase captions, flat search). A short 2–5 action list stays a
  dropdown. Every dialog on phone is a bottom sheet. Menu icon is horizontal `more`.
- **Words over icons.** A phone has no tooltips. An icon stands alone only when it reads
  by itself; otherwise the control says what it does in words.
- **Hidden gestures.** Long press only repeats an action or guards a dangerous one.
  Anything important also has a visible way in via `···`.
- **Long names.** Lead with the primary name, whole; folder/secondary goes on a muted
  line below and truncates first.
- **Numbers.** Only what the client really knows; label what a figure covers; compact
  tokens (`13.7M`).

## State colors

Use state tokens for status only: `--info` (working), `--success` (done/waiting to read),
`--warning` (waiting on user), `--error`/destructive (error). See
`references/tokens-and-examples.md` for values. Never use a state colour for a non-state
thing.

## Motion and continuity

**Rule: animate only `transform` and `opacity`.** Geometry triggers layout; non-composited
properties recalculate style continuously.

- **Reduced motion first.** Under `prefers-reduced-motion: reduce`, disable the expand,
  morphs, springs, and parallax; keep short opacity fades (or instant). Never disable
  state feedback (focus, loading).
- **Continuity via an expandable card, not a page swap.** The tapped list row itself grows
  in place to fullscreen; the rows above and below move aside by exactly the card's edge
  travel (no gap opens); the new detail content fades in across the grow. The row's title
  grows with the card from list size to detail size, so the eye follows the same object.
  Do not use the View Transitions API for this; keep the list mounted (SvelteKit layout)
  and let the active row become the card. Compute the push distances with
  `pushDistances` / `pushDirection` (`$lib/thoughts-transition.ts`).
- **Top bar stays put.** The list header remains; no divider line. On open the title
  drops to its small (scrolled) size and a back arrow fades in to its left; the title
  eases inward slightly (1.25rem) to make room. The top bar has a fixed height (56px) so
  the card target never moves during the animation. The back control is a 40px target
  with the glyph aligned to the row content's left edge.
- **Geometry is allowed only for the expandable card.** It transitions `top`, `left`,
  `width`, `height` from the row rect to the stage (`clamp to viewport`, below the top
  bar). Everything else animates `transform`/`opacity`. Keep it to that one element and
  ~380ms; do not animate layout for other surfaces.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out) both ways so open and close
  feel the same. Text fades at natural size (~200ms); no scaling that stretches text.
- **Back symmetry:** the close animation is the open animation in reverse, same duration
  and easing; the card returns to the exact original rect (clear inline geometry after),
  and the list lands where the user left it.
- **Focus:** move focus into the expanded card (heading or container) when it settles;
  return it to the row on close.
- **Scroll-aware title (list at rest):** the list title shrinks past ~40px of scroll; when
  a card expands the title is small by state, not scroll. The bar is opaque and content
  scrolls under it, so it carries a short gradient strip below its bottom edge (never a
  line) to soften that boundary. The same strip is present while a card is open.
- **Floating surfaces vs the card:** menus/popovers/pickers floating over scrolling
  content use a gradient backdrop; modal/bottom-sheet scrims use a dim scrim. The
  expandable card is opaque fullscreen (no scrim, no shadow at rest).

## Motion tokens (provisional, tune by eye)

```
--m-dur-fast: 150ms;  --m-dur-base: 250ms;  --m-dur-expand: 380ms (expandable card);
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
/* spring-lite and view-transition morph rules were dropped: the detail uses an
   in-place expandable card, not the View Transitions API. */
```

## Review before finishing

A UI change is done when each holds on the changed screens:

- every surface follows the depth rule (no box-in-box, no line without meaning);
- interacting with each control moves nothing it did not touch; popups open toward room
  in the smallest window showing them;
- no surface stacks header/tabs/toolbar/search as separate rows; no toolbar wraps;
- controls hug their content; only form fields and canvases fill;
- icons sit inline; rows read in one line where they fit;
- the zone stays within its rest budget; colour marks only state;
- secondary text is full-strength muted, not opacity-faded;
- the screen was checked in both light and dark themes;
- reduced-motion path verified.
  EOF
