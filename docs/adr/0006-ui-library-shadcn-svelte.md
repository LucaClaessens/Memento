# UI library: shadcn-svelte (copy-paste on Tailwind + Bits UI)

Memento's UI is a SvelteKit PWA with simple, mobile-first flows (capture, check-ins,
inbox, review). We chose shadcn-svelte over m3-svelte, Skeleton, and DaisyUI because
it ships a broad component set (including mobile-friendly Sheet/Drawer/Dialog), is
accessible via Bits UI primitives, themes through Tailwind CSS variables, and —
crucially — copies component source into our repo so we own and can adjust every line
as a solo developer. m3-svelte was rejected as too limited (~10 components, manual
theming); Skeleton as more opinionated and less owned; DaisyUI as CSS-only with no
component logic.

Consequences: Tailwind CSS and the `cn` utility become part of the stack; components
live under `apps/web/src/lib/components/ui/`; theming is driven by CSS variables in
`app.css`.
