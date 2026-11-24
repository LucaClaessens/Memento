// SQLite + SQLCipher access. Single file, encrypted at rest (ADR-0003).
// Migrations live in ./migrations and run on startup.
export const DB_PATH = process.env.MEMENTO_DB_PATH ?? "./data/memento.db";
