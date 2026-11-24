# SQLite + SQLCipher as the only datastore

Single user, local-first, on a Mac Mini. SQLite is a single file (trivial backups: copy
it), needs no daemon, and SQLCipher gives encryption at rest for health-adjacent data.
Postgres would add an operational dependency and a backup story for no benefit at this
scale. The whole DB is one file the user can delete for a complete data wipe.

Considered Options: Postgres — rejected as overkill for a single-user local service.
Managed/remote DB — rejected because data must stay local.
