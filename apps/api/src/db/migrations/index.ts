import type { Db } from "../types.js";
import { migration as createEntries } from "./001-create-entries.js";
import { migration as addThreadsAndTitles } from "./002-entries-threads-and-titles.js";

export interface Migration {
  id: string;
  up(db: Db): void;
}

export const migrations: Migration[] = [createEntries, addThreadsAndTitles];

/** Applies each migration once, in order, recording it in `schema_migrations`. */
export function runMigrations(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    db
      .prepare<[], { id: string }>("SELECT id FROM schema_migrations")
      .all()
      .map((row) => row.id)
  );
  const record = db.prepare<[string, string]>(
    "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)"
  );

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }

    db.transaction(() => {
      migration.up(db);
      record.run(migration.id, new Date().toISOString());
    })();
  }
}
