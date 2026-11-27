import { firstLineTitle, type Entry } from "@memento/shared";
import type { Db } from "./types.js";

export interface NewEntry {
  id: string;
  rawText: string;
  source: Entry["source"];
  createdAt: string;
  parentId?: string | null;
  transcriptionStatus?: Entry["transcriptionStatus"];
  audioPath?: string | null;
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
  audio_path: string | null;
  transcription_status: Entry["transcriptionStatus"];
}

const COLUMNS =
  "id, raw_text, source, created_at, parent_id, title, summary, title_source, synced, synced_at, audio_path, transcription_status";

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
    audioPath: row.audio_path,
    transcriptionStatus: row.transcription_status,
  };
}

export function createEntriesRepository(db: Db) {
  const insert = db.prepare<
    Omit<NewEntry, "parentId"> & {
      parentId: string | null;
      title: string;
      transcriptionStatus: Entry["transcriptionStatus"];
      audioPath: string | null;
    }
  >(`
    INSERT INTO entries (
      id, raw_text, source, created_at, parent_id, title, summary, title_source, synced, synced_at, audio_path, transcription_status
    )
    VALUES (
      @id, @rawText, @source, @createdAt, @parentId, @title, NULL, 'first_line', 1, @createdAt, @audioPath, @transcriptionStatus
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

  const updateTranscriptionStmt = db.prepare<
    [string, string | null, string, string]
  >(
    `UPDATE entries SET raw_text = ?, title = ?, title_source = 'first_line', transcription_status = ? WHERE id = ?`
  );
  const setAudioPathStmt = db.prepare<[string | null, string]>(
    `UPDATE entries SET audio_path = ? WHERE id = ?`
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
        transcriptionStatus: input.transcriptionStatus ?? "done",
        audioPath: input.audioPath ?? null,
      });
      return { entry: read(input.id), created: info.changes === 1 };
    },

    /** A single entry, or null when it does not exist. */
    get(id: string): Entry | null {
      const row = byId.get(id);
      return row ? toEntry(row) : null;
    },

    /** Update transcription result (transcript text + status). */
    updateTranscription(
      id: string,
      status: Entry["transcriptionStatus"],
      rawText?: string,
      title?: string | null
    ): Entry {
      const existing = read(id);
      const nextText = rawText ?? existing.rawText;
      const nextTitle =
        title ?? (rawText ? firstLineTitle(rawText) : existing.title);
      updateTranscriptionStmt.run(nextText, nextTitle, status, id);
      return read(id);
    },

    /** Set or clear the stored audio path. */
    setAudioPath(id: string, audioPath: string | null): Entry {
      setAudioPathStmt.run(audioPath, id);
      return read(id);
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
