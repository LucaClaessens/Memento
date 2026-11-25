import {
  EntryListSchema,
  EntrySchema,
  type CreateEntry,
  type Entry,
} from "@memento/shared";
import type { ApiClient } from "./client";

export function createEntriesApi(client: ApiClient) {
  return {
    /** Newest first, as ordered by the API. */
    async list(limit = 50): Promise<Entry[]> {
      const payload = await client.get(`/entries?limit=${limit}`);
      return EntryListSchema.parse(payload).entries;
    },

    async create(input: CreateEntry): Promise<Entry> {
      const payload = await client.post("/entries", input);
      return EntrySchema.parse(payload);
    },
  };
}

export type EntriesApi = ReturnType<typeof createEntriesApi>;
