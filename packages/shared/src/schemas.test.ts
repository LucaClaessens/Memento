import { describe, expect, it } from "vitest";
import { EntrySchema, PersonSchema } from "../src/index";

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
