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

Close is the same animation in reverse: fade detail out (~180ms), shrink to the saved
rect for the same duration, then clear inline geometry. Clear inline `top/left/width/
height` after shrinking so the row resizes correctly when it returns to the list.

Why not the View Transitions API: it snapshots pages and needs unique
`view-transition-name`s; it does not model "the card grows and pushes its neighbours
aside". The in-place card does, and keeps the list's scroll position intact.

## Top bar with a state-driven back arrow

The list header is a fixed 56px bar with no divider line. At rest the title is large.
When a card opens, the title drops to its small size and a back arrow fades in to its
left; the title does not move (the arrow lives in the header's left padding).

```svelte
<header class="thoughts-header" class:small>
  <button
    class="back-arrow"
    class:visible={small}
    aria-label="Back to thoughts"
  >
    ←
  </button>
  <h1 class="title">Thoughts</h1>
</header>
```

```css
.thoughts-header {
  position: relative;
  z-index: 5;
  display: flex;
  flex: 0 0 3.5rem;
  height: 3.5rem; /* fixed: the card target never moves */
  align-items: center;
  padding: 0 1rem;
  background: var(--background);
}
.back-arrow {
  position: absolute;
  left: 0.125rem;
  top: 50%;
  transform: translate(-0.35rem, -50%);
  opacity: 0;
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}
.small .back-arrow {
  opacity: 1;
  transform: translate(0, -50%);
}
.title {
  font-size: 2.25rem;
  width: fit-content;
  transition: font-size var(--m-dur-base) var(--ease-out);
}
.small .title {
  font-size: 1.125rem;
}
```

## Examples: Memento screens

- **Thoughts list → thought detail:** the tapped row grows to fullscreen, neighbours
  move aside and fade, the row title grows to the detail title size, detail content
  fades in; close reverses it and returns to the original row.
- **Bottom nav:** already raised pill with tone step; keep as the reference for
  "controls stand up".
- **Capture form:** input pressed-in in light theme; submit button raised.
- **Check-in:** energy 1–5 as compact chips (hug content), not full-width bars.

## Compatibility

- SvelteKit: keep the list in a `+layout.svelte` so it stays mounted under the detail
  route; the detail route only sets the active id.
- Component primitives: shadcn-svelte (do not replace).
- Tokens: Tailwind v4 `@theme inline` in `app.css`.
