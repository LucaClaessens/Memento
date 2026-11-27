import type { CreateEntry, Entry } from "@memento/shared";
import { describe, expect, it } from "vitest";
import type { EntriesApi } from "$lib/api";
import { ApiError } from "$lib/api/client";
import { createThoughtDetailStore } from "./thought-detail.svelte";

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

function fakeEntriesApi(overrides: Partial<EntriesApi> = {}): EntriesApi {
  return {
    list: async () => [],
    get: async () => newEntry(),
    create: async (input: CreateEntry) =>
      newEntry({ id: input.id ?? "created", rawText: input.rawText }),
    transcribeAudio: async () => "",
    ...overrides,
  };
}

const thought = newEntry({ id: "thought", rawText: "the original" });

describe("thought detail store", () => {
  it("loads the thought and sorts follow-ups chronologically", async () => {
    const older = newEntry({
      id: "older",
      parentId: thought.id,
      createdAt: "2026-11-27T09:00:00.000Z",
    });
    const newer = newEntry({
      id: "newer",
      parentId: thought.id,
      createdAt: "2026-11-27T11:00:00.000Z",
    });
    const store = createThoughtDetailStore(
      fakeEntriesApi({
        get: async () => thought,
        // The API returns newest first; the thread reads oldest first.
        list: async () => [newer, older],
      })
    );

    await store.load(thought.id);

    expect(store.thought).toEqual(thought);
    expect(store.followUps.map((entry) => entry.id)).toEqual([
      "older",
      "newer",
    ]);
    expect(store.loading).toBe(false);
    expect(store.notFound).toBe(false);
  });

  it("marks a missing thought as not found", async () => {
    const store = createThoughtDetailStore(
      fakeEntriesApi({
        get: async () => {
          throw new ApiError("entry_not_found", 404);
        },
      })
    );

    await store.load("missing");

    expect(store.notFound).toBe(true);
    expect(store.loadError).toBeNull();
    expect(store.thought).toBeNull();
  });

  it("reports a load failure that is not a 404", async () => {
    const store = createThoughtDetailStore(
      fakeEntriesApi({
        get: async () => {
          throw new ApiError("network_error", 0);
        },
      })
    );

    await store.load(thought.id);

    expect(store.notFound).toBe(false);
    expect(store.loadError).toContain("Couldn’t load this thought");
  });

  it("adds a follow-up into the thread in chronological order", async () => {
    const created = newEntry({
      id: "created",
      parentId: thought.id,
      createdAt: "2026-11-27T11:00:00.000Z",
    });
    const store = createThoughtDetailStore(
      fakeEntriesApi({
        get: async () => thought,
        list: async () => [],
        create: async () => created,
      })
    );
    await store.load(thought.id);

    const added = await store.addFollowUp(thought.id, "a follow-up");

    expect(added).toBe(true);
    expect(store.followUps.map((entry) => entry.id)).toEqual(["created"]);
    expect(store.submitting).toBe(false);
    expect(store.submitError).toBeNull();
  });

  it("returns false and keeps the error message when a follow-up fails", async () => {
    const store = createThoughtDetailStore(
      fakeEntriesApi({
        create: async () => {
          throw new Error("API down");
        },
      })
    );

    const added = await store.addFollowUp(thought.id, "a follow-up");

    expect(added).toBe(false);
    expect(store.submitting).toBe(false);
    expect(store.submitError).toContain("Your text is still here");
  });
});
