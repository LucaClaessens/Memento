# SQLite + SQLCipher as the only datastore

Single user, local-first, on a Mac Mini. SQLite is a single file (trivial backups: copy
it), needs no daemon, and SQLCipher gives encryption at rest for health-adjacent data.
Postgres would add an operational dependency and a backup story for no benefit at this
scale. The whole DB is one file the user can delete for a complete data wipe.

Considered Options: Postgres — rejected as overkill for a single-user local service.
Managed/remote DB — rejected because data must stay local.

## Amendment (2026-11-25, #2)

The text-capture slice ships on plain `better-sqlite3` to keep the tracer bullet small.
The database file is therefore **not encrypted at rest yet**. SQLCipher is tracked in
#31: replace the driver (or compile `better-sqlite3` against SQLCipher), document where
the key lives, and migrate an existing plaintext file. Until #31 lands, treat the DB file
as sensitive and keep it out of shared backups.
