import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createEntriesRepository, type NewEntry } from "./entries.js";
import { openDatabase } from "./index.js";

const tempDirs: string[] = [];

function tempDbPath(): string {
  const dir = mkdtempSync(join(tmpdir(), "memento-db-"));
  tempDirs.push(dir);
  return join(dir, "memento.db");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function newEntry(overrides: Partial<NewEntry> = {}): NewEntry {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    rawText: "hello",
    source: "text",
    createdAt: "2026-11-25T10:00:00.000Z",
    ...overrides,
  };
}

describe("entries repository", () => {
  it("stores an entry and marks it synced with the server timestamp", () => {
    const db = openDatabase(":memory:");
    const entries = createEntriesRepository(db);

    const result = entries.create(newEntry({ rawText: "  typed exactly\n " }));

    expect(result.created).toBe(true);
    expect(result.entry).toEqual({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      rawText: "  typed exactly\n ",
      source: "text",
      createdAt: "2026-11-25T10:00:00.000Z",
      synced: true,
      syncedAt: "2026-11-25T10:00:00.000Z",
    });
    expect(entries.list(10)).toEqual([result.entry]);
    db.close();
  });

  it("is idempotent by id and does not overwrite the stored entry", () => {
    const db = openDatabase(":memory:");
    const entries = createEntriesRepository(db);
    const first = entries.create(newEntry());
    const second = entries.create(
      newEntry({ rawText: "a retry with different text" })
    );

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.entry).toEqual(first.entry);
    expect(entries.list(10)).toHaveLength(1);
    db.close();
  });

  it("lists newest first, ties broken by id, respecting the limit", () => {
    const db = openDatabase(":memory:");
    const entries = createEntriesRepository(db);
    entries.create(
      newEntry({ id: "a", createdAt: "2026-11-25T09:00:00.000Z" })
    );
    entries.create(
      newEntry({ id: "b", createdAt: "2026-11-25T11:00:00.000Z" })
    );
    entries.create(
      newEntry({ id: "c", createdAt: "2026-11-25T10:00:00.000Z" })
    );
    entries.create(
      newEntry({ id: "d", createdAt: "2026-11-25T11:00:00.000Z" })
    );

    expect(entries.list(10).map((entry) => entry.id)).toEqual([
      "d",
      "b",
      "c",
      "a",
    ]);
    expect(entries.list(2).map((entry) => entry.id)).toEqual(["d", "b"]);
    db.close();
  });

  it("keeps data across a reopen and applies migrations once", () => {
    const path = tempDbPath();

    const first = openDatabase(path);
    createEntriesRepository(first).create(newEntry());
    first.close();

    const second = openDatabase(path);
    const rows = createEntriesRepository(second).list(10);
    const migrations = second
      .prepare<[], { id: string }>("SELECT id FROM schema_migrations")
      .all();

    expect(rows.map((entry) => entry.rawText)).toEqual(["hello"]);
    expect(migrations.map((row) => row.id)).toEqual(["001-create-entries"]);
    second.close();
  });
});
