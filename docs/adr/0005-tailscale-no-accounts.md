# No user accounts in v1; Tailscale is the auth and network boundary

Memento is single-user and self-hosted. Tailscale restricts access to the user's own
devices, so accounts, passwords, and sessions are unnecessary overhead. A single shared
API token on the phone is kept as defense-in-depth. The backend is structured with an
auth middleware slot so a real auth solution can be dropped in later without rewriting
routes.

Considered Options: full user accounts (email/password or OAuth) — rejected as
unnecessary complexity for a single-user local tool; revisit if Memento ever serves more
than one person.
