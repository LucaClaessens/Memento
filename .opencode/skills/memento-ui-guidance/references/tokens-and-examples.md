# Memento UI reference: tokens and examples

Companion to `memento-ui-guidance`. Concrete token values, state colors, and
Memento-specific examples.

## State color tokens (add to app.css)

```css
:root {
  --info: oklch(0.55 0.18 250);
  --info-foreground: oklch(0.985 0 0);
  --success: oklch(0.6 0.17 150);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.72 0.16 75);
  --warning-foreground: oklch(0.145 0 0);
  /* error already exists as --destructive */
}
.dark {
  --info: oklch(0.7 0.16 250);
  --info-foreground: oklch(0.145 0 0);
  --success: oklch(0.72 0.16 150);
  --success-foreground: oklch(0.145 0 0);
  --warning: oklch(0.78 0.14 75);
  --warning-foreground: oklch(0.145 0 0);
}
```

Map these into Tailwind via `@theme inline` (e.g. `--color-info: var(--info)`) so
utilities like `bg-info`, `text-info-foreground` work. Tailor the oklch values by eye
in both themes; keep 4.5:1 contrast for text.

## Motion tokens

```css
:root {
  --m-dur-fast: 150ms;
  --m-dur-base: 250ms;
  --m-dur-expand: 380ms; /* expandable card, both ways */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

Under `prefers-reduced-motion: reduce`, set durations to 0/1ms and keep only short
opacity fades.

## Expandable card pattern (list row → fullscreen detail)

Keep the list mounted (a SvelteKit `+layout.svelte` under the list route), render the
expanded card as a `position: fixed` overlay, and look up the source row by a stable
data attribute (`data-thought-id`) to get its rect.

```ts
// 1. measure the tapped row (viewport coords)
const source = document.querySelector<HTMLElement>(
  `[data-thought-id="${entry.id}"]`
);
const r = source!.getBoundingClientRect();
el.style.top = `${r.top}px`;
el.style.left = `${r.left}px`;
el.style.width = `${r.width}px`;
el.style.height = `${r.height}px`;

// 2. next frame, grow to the stage (below the fixed 56px top bar)
el.style.top = "56px";
el.style.left = "0px";
el.style.width = `${window.innerWidth}px`;
el.style.height = `${window.innerHeight - 56}px`;

// 3. fade the new detail content in after the grow
setTimeout(() => (showDetail = true), 240);
```

```css
.expanded-card {
  position: fixed;
  z-index: 50;
  overflow-y: auto;
  background: var(--background); /* opaque; no shadow at rest */
  transition:
    top var(--m-dur-expand) var(--ease-out),
    left var(--m-dur-expand) var(--ease-out),
    width var(--m-dur-expand) var(--ease-out),
    height var(--m-dur-expand) var(--ease-out);
}
.expanded-card .title {
  font-size: 1.06rem; /* row size at start */
  transition: font-size var(--m-dur-expand) var(--ease-out);
}
.expanded-card[data-phase="open"] .title {
  font-size: 2.25rem; /* detail size */
}

@media (prefers-reduced-motion: reduce) {
  .expanded-card,
  .expanded-card .title {
    transition: none;
  }
}
```

Close is the same animation in reverse and starts on the same frame: set the title back
to list size, reset the push distances to 0 (so siblings return as the card shrinks),
fade the detail out, and shrink to the saved rect. Clear inline `top/left/width/height`
after shrinking so the row resizes correctly when it returns to the list.

Why not the View Transitions API: it snapshots pages and needs unique
`view-transition-name`s; it does not model "the card grows and pushes its neighbours
aside". The in-place card does, and keeps the list's scroll position intact.

## Top bar with a state-driven back arrow

The list header is a sticky 56px bar with no divider line. At rest the title is large.
On scroll it shrinks; when a card opens it is small by state and a 40px back target
fades in to its left, with the glyph aligned to the row content's left edge. The title
eases inward 1.25rem to make room. The bar is opaque with a short gradient strip below
it so content scrolls under without a hard edge.

```svelte
<header class="thoughts-header" class:small class:back class:scrolled>
  <div class="topbar-gradient" aria-hidden="true"></div>
  <button class="back-arrow" aria-label="Back to thoughts">←</button>
  <h1 class="title">Thoughts</h1>
</header>
```

```css
.thoughts-header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  height: 3.5rem; /* fixed: the card target never moves */
  align-items: center;
  padding: 0;
  background: var(--background);
}
.topbar-gradient {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 1rem;
  background: linear-gradient(to bottom, var(--background), transparent);
  opacity: 0;
  transition: opacity 200ms var(--ease-out);
  pointer-events: none;
}
.scrolled .topbar-gradient {
  opacity: 1;
}
.back-arrow {
  position: absolute;
  /* The header sits inside the main's 1rem padding, so pull the target back
     to align the glyph with the row content. */
  left: -0.9rem;
  top: 50%;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted-foreground);
  font-size: 0.85rem;
  opacity: 0;
  transform: translate(-0.35rem, -50%);
  pointer-events: none;
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}
.back .back-arrow {
  opacity: 1;
  transform: translate(0, -50%);
  pointer-events: auto;
}
.title {
  font-size: 2.25rem;
  width: fit-content;
  transition:
    font-size var(--m-dur-base) var(--ease-out),
    margin-left var(--m-dur-base) var(--ease-out);
}
.small .title {
  font-size: 1.125rem;
}
.back .title {
  margin-left: 1.25rem;
}
```

## Examples: Memento screens

- **Thoughts list → thought detail:** the tapped row grows to fullscreen, rows above and
  below move aside by the card's edge travel and fade out on the same timeline (no gap), the row title grows to the
  detail title size, detail content fades in across the grow; close reverses it and
  returns to the original row.
- **Bottom nav:** already raised pill with tone step; keep as the reference for
  "controls stand up".
- **Capture form:** input pressed-in in light theme; submit button raised.
- **Check-in:** energy 1–5 as compact chips (hug content), not full-width bars.

## Compatibility

- SvelteKit: keep the list in a `+layout.svelte` so it stays mounted under the detail
  route; the detail route only sets the active id.
- Component primitives: shadcn-svelte (do not replace).
- Tokens: Tailwind v4 `@theme inline` in `app.css`.
