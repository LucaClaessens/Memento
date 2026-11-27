import { firstLineTitle } from "@memento/shared";
import type { Db } from "../types.js";

interface EntryRow {
  id: string;
  raw_text: string;
}

export const migration = {
  id: "002-entries-threads-and-titles",
  up(db: Db): void {
    db.exec(`
      ALTER TABLE entries ADD COLUMN parent_id TEXT REFERENCES entries(id) ON DELETE SET NULL;
      ALTER TABLE entries ADD COLUMN title TEXT;
      ALTER TABLE entries ADD COLUMN summary TEXT;
      ALTER TABLE entries ADD COLUMN title_source TEXT CHECK (title_source IN ('first_line', 'ai'));

      CREATE INDEX entries_parent_id ON entries (parent_id);
    `);

    // Titles are derived projections; existing rows get the first-line fallback.
    const rows = db
      .prepare<[], EntryRow>("SELECT id, raw_text FROM entries")
      .all();
    const backfill = db.prepare<[string, string]>(
      "UPDATE entries SET title = ?, title_source = 'first_line' WHERE id = ?"
    );

    for (const row of rows) {
      backfill.run(firstLineTitle(row.raw_text), row.id);
    }
  },
};
