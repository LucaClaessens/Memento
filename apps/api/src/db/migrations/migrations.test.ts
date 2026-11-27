import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migration as createEntries } from "./001-create-entries.js";
import { migration as addThreadsAndTitles } from "./002-entries-threads-and-titles.js";

interface ColumnRow {
  name: string;
}

interface IndexRow {
  name: string;
}

interface ForeignKeyRow {
  table: string;
  from: string;
  to: string;
  on_delete: string;
}

interface LegacyRow {
  parent_id: string | null;
  title: string | null;
  summary: string | null;
  title_source: string | null;
}

function legacyDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  createEntries.up(db);
  db.prepare(
    "INSERT INTO entries (id, raw_text, source, created_at) VALUES (?, ?, 'text', ?)"
  ).run(
    "legacy-entry",
    "  A legacy title  \nsecond line",
    "2026-11-25T10:00:00.000Z"
  );
  return db;
}

describe("002-entries-threads-and-titles", () => {
  it("adds the thread and projection columns plus the parent index", () => {
    const db = legacyDatabase();
    addThreadsAndTitles.up(db);

    const columns = db
      .prepare<[], ColumnRow>("PRAGMA table_info(entries)")
      .all()
      .map((row) => row.name);
    const indexes = db
      .prepare<[], IndexRow>("PRAGMA index_list(entries)")
      .all()
      .map((row) => row.name);

    expect(columns).toEqual(
      expect.arrayContaining(["parent_id", "title", "summary", "title_source"])
    );
    expect(indexes).toContain("entries_parent_id");
    db.close();
  });

  it("backfills the first-line title and leaves the summary empty", () => {
    const db = legacyDatabase();
    addThreadsAndTitles.up(db);

    const row = db
      .prepare<[], LegacyRow>(
        "SELECT parent_id, title, summary, title_source FROM entries WHERE id = 'legacy-entry'"
      )
      .get();

    expect(row).toEqual({
      parent_id: null,
      title: "A legacy title",
      summary: null,
      title_source: "first_line",
    });
    db.close();
  });

  it("cascades a deleted parent to a null parent_id", () => {
    const db = legacyDatabase();
    addThreadsAndTitles.up(db);

    const foreignKeys = db
      .prepare<[], ForeignKeyRow>("PRAGMA foreign_key_list(entries)")
      .all();
    expect(foreignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "entries",
          from: "parent_id",
          to: "id",
          on_delete: "SET NULL",
        }),
      ])
    );

    db.prepare(
      "INSERT INTO entries (id, raw_text, source, created_at, parent_id) VALUES (?, ?, 'text', ?, ?)"
    ).run(
      "child-entry",
      "a follow-up",
      "2026-11-25T11:00:00.000Z",
      "legacy-entry"
    );
    db.prepare("DELETE FROM entries WHERE id = ?").run("legacy-entry");

    const child = db
      .prepare<[], { parent_id: string | null }>(
        "SELECT parent_id FROM entries WHERE id = 'child-entry'"
      )
      .get();
    expect(child?.parent_id).toBeNull();
    db.close();
  });
});
