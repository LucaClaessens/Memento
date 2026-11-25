import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { runMigrations } from "./migrations/index.js";
import type { Db } from "./types.js";

export const DEFAULT_DB_PATH = "./data/memento.db";

/**
 * Opens (and creates) the SQLite database, then applies pending migrations.
 * Pass `:memory:` for tests.
 */
export function openDatabase(
  path = process.env.MEMENTO_DB_PATH ?? DEFAULT_DB_PATH
): Db {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);

  return db;
}
