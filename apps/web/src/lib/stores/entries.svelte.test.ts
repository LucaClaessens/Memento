import type { CreateEntry, Entry } from "@memento/shared";
import { describe, expect, it } from "vitest";
import { createEntriesStore } from "./entries.svelte";
import type { EntriesStoreApi } from "./entries.svelte";

function newEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    rawText: "hello",
    source: "text",
    createdAt: "2026-11-27T10:00:00.000Z",
    parentId: null,
    title: "hello",
    summary: null,
    titleSource: "first_line",
    synced: true,
    syncedAt: "2026-11-27T10:00:00.000Z",
    ...overrides,
  };
}

function fakeEntriesApi(
  overrides: Partial<EntriesStoreApi> = {}
): EntriesStoreApi {
  return {
    list: async () => [],
    create: async (input: CreateEntry) =>
      newEntry({ id: input.id ?? "created", rawText: input.rawText }),
    transcribeAudio: async () => "",
    ...overrides,
  };
}

describe("entries store", () => {
  it("loads entries from the API and clears the loading flag", async () => {
    const entry = newEntry();
    const store = createEntriesStore(
      fakeEntriesApi({ list: async () => [entry] })
    );

    await store.load();

    expect(store.entries).toEqual([entry]);
    expect(store.loading).toBe(false);
    expect(store.loadError).toBeNull();
  });

  it("keeps the existing entries when a reload fails", async () => {
    const entry = newEntry();
    let calls = 0;
    const store = createEntriesStore(
      fakeEntriesApi({
        list: async () => {
          calls += 1;
          if (calls === 2) {
            throw new Error("API down");
          }
          return [entry];
        },
      })
    );
    await store.load();

    await store.load();

    expect(store.entries).toEqual([entry]);
    expect(store.loading).toBe(false);
    expect(store.loadError).toContain("Couldn’t load your entries");
  });

  it("prepends a captured entry and replaces a duplicate id", async () => {
    const existing = newEntry({ id: "existing", rawText: "older" });
    const created = newEntry({ id: "created", rawText: " new thought " });
    const store = createEntriesStore(
      fakeEntriesApi({
        list: async () => [existing, created],
        create: async () => created,
      })
    );
    await store.load();

    const captured = await store.capture("new thought");

    expect(captured).toBe(true);
    expect(store.entries.map((entry) => entry.id)).toEqual([
      "created",
      "existing",
    ]);
    expect(store.submitting).toBe(false);
    expect(store.submitError).toBeNull();
  });

  it("returns false and keeps the error message when capture fails", async () => {
    const store = createEntriesStore(
      fakeEntriesApi({
        create: async () => {
          throw new Error("API down");
        },
      })
    );

    const captured = await store.capture("still in the textarea");

    expect(captured).toBe(false);
    expect(store.submitting).toBe(false);
    expect(store.submitError).toContain("Your text is still here");
  });
});
