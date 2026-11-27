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

- **Reduced motion first.** Under `prefers-reduced-motion: reduce`, disable morphs,
  springs, and parallax; keep short opacity fades (or instant). Never disable state
  feedback (focus, loading).
- **Continuity via shared-element transition.** The primary identity (title) morphs
  between list and detail instead of disappearing, using the View Transitions API. Use
  SvelteKit's `onNavigate` + `document.startViewTransition` (or `sveltekit-view-transition`)
  to offload. Name only the pair that morphs; assign the name dynamically to the tapped
  item before the transition and clean up after.
- **Duration ~300ms** for the morph; past ~400ms it feels like waiting. Text cross-fades
  at natural size (shorter, ~200ms) so it doesn't stretch/blur. Root cross-fade off.
- **Easing:** slight spring-lite `cubic-bezier(0.22, 1.05, 0.36, 1)` for the morph;
  `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out) for entrances. Exits shorter, ease-in.
  Avoid heavy overshoot (reads as playful, not calm).
- **Nest parts** under a container (`view-transition-group: contain`) to avoid the
  "shattered morph"; text cross-fades rather than scales.
- **Preserve scroll position:** restore scroll inside the update callback before the
  after-snapshot, so back-navigation lands where the user was.
- **Fallback:** if no `startViewTransition` or reduced motion, just apply the state change.
  No polyfill.
- **Focus:** shift focus to the new heading/container after the transition resolves.
- **Name the minimum:** every extra name is another group to reconcile.
- **Clean up** temporary `view-transition-name` values after `finished` resolves.
- **Scroll-aware title:** list page titles shrink on scroll and gain a gradient backdrop
  (solid → transparent) so content scrolls under; keep the title in flow (no fixed bar)
  to avoid layout shift.
- **Overlay backdrop gradient rule:** any surface floating over scrolling content (title
  bar, sticky headers, bottom nav, popovers) uses a gradient backdrop; modal/bottom-sheet
  scrims use a dim scrim instead. Two distinct treatments, never mixed.

## Motion tokens (provisional, tune by eye)

```
--m-dur-fast: 150ms;  --m-dur-base: 250ms;  --m-dur-slow: 300ms (morph);
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--spring-lite: cubic-bezier(0.22, 1.05, 0.36, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
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
