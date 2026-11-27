import { describe, expect, it } from "vitest";
import {
  CreateEntrySchema,
  EntryListSchema,
  EntrySchema,
  firstLineTitle,
  MAX_ENTRY_LENGTH,
  PersonSchema,
} from "../src/index";

describe("shared schemas", () => {
  it("parses a valid entry", () => {
    const entry = EntrySchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      rawText: "hello",
      source: "text",
      createdAt: new Date().toISOString(),
      synced: false,
      syncedAt: null,
    });
    expect(entry.rawText).toBe("hello");
    expect(entry.parentId).toBeNull();
    expect(entry.title).toBeNull();
    expect(entry.summary).toBeNull();
    expect(entry.titleSource).toBeNull();
  });

  it("parses a threaded entry with a title and summary", () => {
    const entry = EntrySchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      rawText: "hello",
      source: "text",
      createdAt: "2026-11-27T10:00:00.000Z",
      parentId: "22222222-2222-4222-8222-222222222222",
      title: "hello",
      summary: "A summary.",
      titleSource: "ai",
      synced: true,
      syncedAt: "2026-11-27T10:00:00.000Z",
    });

    expect(entry.parentId).toBe("22222222-2222-4222-8222-222222222222");
    expect(entry.titleSource).toBe("ai");
  });

  it("parses a valid person", () => {
    const person = PersonSchema.parse({
      id: "22222222-2222-4222-8222-222222222222",
      name: "Ada",
      birthday: null,
      lastContact: null,
      notes: "",
      createdAt: new Date().toISOString(),
    });
    expect(person.name).toBe("Ada");
  });
});

describe("CreateEntrySchema", () => {
  it("defaults source to text and keeps rawText exactly as typed", () => {
    const input = CreateEntrySchema.parse({ rawText: "  hello\nworld  " });
    expect(input).toEqual({ rawText: "  hello\nworld  ", source: "text" });
  });

  it("accepts a client-generated id, createdAt, and parentId", () => {
    const input = CreateEntrySchema.parse({
      id: "33333333-3333-4333-8333-333333333333",
      rawText: "hello",
      createdAt: "2026-11-25T10:00:00.000Z",
      parentId: "44444444-4444-4444-8444-444444444444",
    });
    expect(input.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(input.createdAt).toBe("2026-11-25T10:00:00.000Z");
    expect(input.parentId).toBe("44444444-4444-4444-8444-444444444444");
  });

  it("accepts a null parentId for a root", () => {
    const input = CreateEntrySchema.parse({ rawText: "hi", parentId: null });
    expect(input.parentId).toBeNull();
  });

  it("rejects whitespace-only text", () => {
    expect(CreateEntrySchema.safeParse({ rawText: " \n\t " }).success).toBe(
      false
    );
  });

  it("rejects text over the maximum length", () => {
    expect(
      CreateEntrySchema.safeParse({ rawText: "a".repeat(MAX_ENTRY_LENGTH + 1) })
        .success
    ).toBe(false);
  });

  it("rejects an invalid id, source, createdAt, or parentId", () => {
    expect(
      CreateEntrySchema.safeParse({ rawText: "hi", id: "nope" }).success
    ).toBe(false);
    expect(
      CreateEntrySchema.safeParse({ rawText: "hi", source: "audio" }).success
    ).toBe(false);
    expect(
      CreateEntrySchema.safeParse({ rawText: "hi", createdAt: "yesterday" })
        .success
    ).toBe(false);
    expect(
      CreateEntrySchema.safeParse({ rawText: "hi", parentId: "nope" }).success
    ).toBe(false);
  });
});

describe("firstLineTitle", () => {
  it("uses the first non-empty line, trimmed", () => {
    expect(firstLineTitle("\n  Morning walk  \nsecond line")).toBe(
      "Morning walk"
    );
  });

  it("caps the title at 80 characters including the ellipsis", () => {
    const title = firstLineTitle("a".repeat(120));

    expect(title).toHaveLength(80);
    expect(title.endsWith("…")).toBe(true);
  });

  it("falls back to Untitled thought when there is no line", () => {
    expect(firstLineTitle(" \n\t ")).toBe("Untitled thought");
  });
});

describe("EntryListSchema", () => {
  it("parses a list response", () => {
    const list = EntryListSchema.parse({
      entries: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          rawText: "hello",
          source: "text",
          createdAt: "2026-11-25T10:00:00.000Z",
          synced: true,
          syncedAt: "2026-11-25T10:00:00.000Z",
        },
      ],
    });
    expect(list.entries).toHaveLength(1);
  });
});
