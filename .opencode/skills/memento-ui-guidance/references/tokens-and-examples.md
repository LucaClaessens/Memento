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
  --m-dur-slow: 300ms; /* morph */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --spring-lite: cubic-bezier(0.22, 1.05, 0.36, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

Under `prefers-reduced-motion: reduce`, set durations to 0/1ms and keep only short
opacity fades.

## Shared-element transition pattern (title morph list → detail)

```svelte
<!-- list row -->
<span
  class="t"
  style:--vt={entry.id}
  style:view-transition-name={selected === entry.id ? "row-title" : undefined}
>
  {title}
</span>

<!-- detail -->
<h1 style:view-transition-name="row-title">{title}</h1>
```

```ts
// in +layout.svelte or a navigation helper
import { onNavigate } from "$app/navigation";

onNavigate((navigation) => {
  if (!document.startViewTransition) return;
  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});
```

```css
::view-transition-group(row-title) {
  animation-duration: var(--m-dur-slow);
  animation-timing-function: var(--spring-lite);
}
::view-transition-old(row-title) {
  animation: 200ms ease-out both fade-out;
}
::view-transition-new(row-title) {
  animation: 200ms ease-in both fade-in;
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(row-title) {
    animation-duration: 1ms;
  }
  ::view-transition-old(row-title),
  ::view-transition-new(row-title) {
    animation-duration: 120ms;
  }
}
```

Cleanup the temporary `view-transition-name` in `transition.finished.finally(...)`.
Restore scroll position inside the update callback before the after-snapshot.
Shift focus to the new heading after the transition resolves.

## Scroll-aware title (list pages)

```svelte
<h1 class:large={!scrolled} class:small={scrolled}>Thoughts</h1>
```

```css
.title-wrap {
  position: sticky;
  top: 0;
  z-index: 5;
}
.title-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--bg) 55%, transparent);
  pointer-events: none;
}
.page-title {
  transition: font-size var(--m-dur-base) var(--ease-out);
  width: fit-content;
}
.page-title.large {
  font-size: 2.25rem;
}
.page-title.small {
  font-size: 1.125rem;
}
```

Toggle the class on scroll past ~40px. Keep the title in flow (no fixed bar).

## Examples: Memento screens

- **Thoughts list → thought detail:** row title morphs to detail h1; scroll position
  restored on back; text cross-fades at natural size.
- **Bottom nav:** already raised pill with tone step; keep as the reference for
  "controls stand up".
- **Capture form:** input pressed-in in light theme; submit button raised.
- **Check-in:** energy 1–5 as compact chips (hug content), not full-width bars.

## Compatibility

- SvelteKit navigation: `onNavigate` (built-in) or `sveltekit-view-transition`.
- Component primitives: shadcn-svelte (do not replace).
- Tokens: Tailwind v4 `@theme inline` in `app.css`.
  EOF
