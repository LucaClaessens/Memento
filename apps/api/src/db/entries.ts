import type { Entry } from "@memento/shared";
import type { Db } from "./types.js";

export interface NewEntry {
  id: string;
  rawText: string;
  source: Entry["source"];
  createdAt: string;
}

export interface CreateEntryResult {
  entry: Entry;
  created: boolean;
}

interface EntryRow {
  id: string;
  raw_text: string;
  source: Entry["source"];
  created_at: string;
  synced: number;
  synced_at: string | null;
}

const COLUMNS = "id, raw_text, source, created_at, synced, synced_at";

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    rawText: row.raw_text,
    source: row.source,
    createdAt: row.created_at,
    synced: row.synced === 1,
    syncedAt: row.synced_at,
  };
}

export function createEntriesRepository(db: Db) {
  const insert = db.prepare<NewEntry>(`
    INSERT INTO entries (id, raw_text, source, created_at, synced, synced_at)
    VALUES (@id, @rawText, @source, @createdAt, 1, @createdAt)
    ON CONFLICT (id) DO NOTHING
  `);
  const byId = db.prepare<[string], EntryRow>(
    `SELECT ${COLUMNS} FROM entries WHERE id = ?`
  );
  const newestFirst = db.prepare<[number], EntryRow>(
    `SELECT ${COLUMNS} FROM entries ORDER BY created_at DESC, id DESC LIMIT ?`
  );

  const read = (id: string): Entry => {
    const row = byId.get(id);
    if (!row) {
      throw new Error(`Entry ${id} could not be read back from the database.`);
    }
    return toEntry(row);
  };

  return {
    /** Inserts a new entry, or returns the existing one for an id already stored. */
    create(input: NewEntry): CreateEntryResult {
      const info = insert.run(input);
      return { entry: read(input.id), created: info.changes === 1 };
    },

    /** Newest first, ties broken by id, so paging is stable. */
    list(limit: number): Entry[] {
      return newestFirst.all(limit).map(toEntry);
    },
  };
}

export type EntriesRepository = ReturnType<typeof createEntriesRepository>;
