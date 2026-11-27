import {
  EntryListSchema,
  EntrySchema,
  type CreateEntry,
  type Entry,
} from "@memento/shared";
import type { ApiClient } from "./client";

export function createEntriesApi(client: ApiClient) {
  return {
    /**
     * Newest first, as ordered by the API. Without a parentId the API returns
     * roots; with one it returns that entry's follow-ups.
     */
    async list(limit = 50, parentId?: string): Promise<Entry[]> {
      const params = new URLSearchParams({ limit: String(limit) });
      if (parentId) {
        params.set("parentId", parentId);
      }

      const payload = await client.get(`/entries?${params.toString()}`);
      return EntryListSchema.parse(payload).entries;
    },

    async get(id: string): Promise<Entry> {
      const payload = await client.get(`/entries/${encodeURIComponent(id)}`);
      return EntrySchema.parse(payload);
    },

    async create(input: CreateEntry): Promise<Entry> {
      const payload = await client.post("/entries", input);
      return EntrySchema.parse(payload);
    },

    async transcribeAudio(file: Blob, signal?: AbortSignal): Promise<string> {
      const form = new FormData();
      form.append("audio", file, "recording.webm");
      const payload = await client.postForm("/transcribe", form, signal);
      const rawText = (payload as { rawText?: unknown }).rawText;
      if (typeof rawText !== "string") {
        throw new Error("Invalid transcription response");
      }
      return rawText;
    },
  };
}

export type EntriesApi = ReturnType<typeof createEntriesApi>;
