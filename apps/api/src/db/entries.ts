import { firstLineTitle, type Entry } from "@memento/shared";
import type { Db } from "./types.js";

export interface NewEntry {
  id: string;
  rawText: string;
  source: Entry["source"];
  createdAt: string;
  parentId?: string | null;
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
  parent_id: string | null;
  title: string | null;
  summary: string | null;
  title_source: Entry["titleSource"];
  synced: number;
  synced_at: string | null;
}

const COLUMNS =
  "id, raw_text, source, created_at, parent_id, title, summary, title_source, synced, synced_at";

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    rawText: row.raw_text,
    source: row.source,
    createdAt: row.created_at,
    parentId: row.parent_id,
    title: row.title,
    summary: row.summary,
    titleSource: row.title_source,
    synced: row.synced === 1,
    syncedAt: row.synced_at,
  };
}

export function createEntriesRepository(db: Db) {
  const insert = db.prepare<
    Omit<NewEntry, "parentId"> & { parentId: string | null; title: string }
  >(`
    INSERT INTO entries (
      id, raw_text, source, created_at, parent_id, title, summary, title_source, synced, synced_at
    )
    VALUES (
      @id, @rawText, @source, @createdAt, @parentId, @title, NULL, 'first_line', 1, @createdAt
    )
    ON CONFLICT (id) DO NOTHING
  `);
  const byId = db.prepare<[string], EntryRow>(
    `SELECT ${COLUMNS} FROM entries WHERE id = ?`
  );
  const rootsNewestFirst = db.prepare<[number], EntryRow>(
    `SELECT ${COLUMNS} FROM entries
     WHERE parent_id IS NULL
     ORDER BY created_at DESC, id DESC
     LIMIT ?`
  );
  const childrenNewestFirst = db.prepare<[string, number], EntryRow>(
    `SELECT ${COLUMNS} FROM entries
     WHERE parent_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ?`
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
      const info = insert.run({
        ...input,
        parentId: input.parentId ?? null,
        title: firstLineTitle(input.rawText),
      });
      return { entry: read(input.id), created: info.changes === 1 };
    },

    /** A single entry, or null when it does not exist. */
    get(id: string): Entry | null {
      const row = byId.get(id);
      return row ? toEntry(row) : null;
    },

    /**
     * Newest first, ties broken by id, so paging is stable.
     * Without a parentId it lists roots; with one it lists that entry's children.
     */
    list(limit: number, parentId: string | null = null): Entry[] {
      return parentId
        ? childrenNewestFirst.all(parentId, limit).map(toEntry)
        : rootsNewestFirst.all(limit).map(toEntry);
    },
  };
}

export type EntriesRepository = ReturnType<typeof createEntriesRepository>;
