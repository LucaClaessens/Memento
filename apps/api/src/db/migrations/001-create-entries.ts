import type { Db } from "../types.js";

export const migration = {
  id: "001-create-entries",
  up(db: Db): void {
    db.exec(`
      CREATE TABLE entries (
        id TEXT PRIMARY KEY,
        raw_text TEXT NOT NULL,
        source TEXT NOT NULL CHECK (source IN ('voice', 'text')),
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        synced_at TEXT
      );

      CREATE INDEX entries_newest_first
        ON entries (created_at DESC, id DESC);
    `);
  },
};
