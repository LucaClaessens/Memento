import { describe, expect, it } from "vitest";
import {
  CreateEntrySchema,
  EntryListSchema,
  EntrySchema,
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

  it("accepts a client-generated id and createdAt", () => {
    const input = CreateEntrySchema.parse({
      id: "33333333-3333-4333-8333-333333333333",
      rawText: "hello",
      createdAt: "2026-11-25T10:00:00.000Z",
    });
    expect(input.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(input.createdAt).toBe("2026-11-25T10:00:00.000Z");
  });

  it("rejects whitespace-only text", () => {
    expect(CreateEntrySchema.safeParse({ rawText: " \n\t " }).success).toBe(
      false
    );
  });

  it("rejects text over 10,000 characters", () => {
    expect(
      CreateEntrySchema.safeParse({ rawText: "a".repeat(10_001) }).success
    ).toBe(false);
  });

  it("rejects an invalid id, source, or createdAt", () => {
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
