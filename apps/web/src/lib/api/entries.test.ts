import type { Entry } from "@memento/shared";
import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, type FetchLike } from "./client";
import { createEntriesApi } from "./entries";

const entry: Entry = {
  id: "11111111-1111-4111-8111-111111111111",
  rawText: "hello",
  source: "text",
  createdAt: "2026-11-25T10:00:00.000Z",
  parentId: null,
  title: "hello",
  summary: null,
  titleSource: "first_line",
  synced: true,
  syncedAt: "2026-11-25T10:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function clientWith(fetchImpl: FetchLike, baseUrl = "http://api.test") {
  return createEntriesApi(createApiClient({ baseUrl, fetch: fetchImpl }));
}

describe("entries API client", () => {
  it("lists entries from the API", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ entries: [entry] }));

    const entries = await clientWith(fetchMock).list(25);

    expect(entries).toEqual([entry]);
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/entries?limit=25", {
      headers: { accept: "application/json" },
    });
  });

  it("requests 50 entries by default", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ entries: [] }));

    await clientWith(fetchMock).list();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/entries?limit=50",
      expect.anything()
    );
  });

  it("requests a parent's follow-ups", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ entries: [entry] }));
    const parentId = "22222222-2222-4222-8222-222222222222";

    const entries = await clientWith(fetchMock).list(50, parentId);

    expect(entries).toEqual([entry]);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/entries?limit=50&parentId=${parentId}`,
      expect.anything()
    );
  });

  it("fetches a single entry by id", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(entry));

    const fetched = await clientWith(fetchMock).get(entry.id);

    expect(fetched).toEqual(entry);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/entries/${entry.id}`,
      { headers: { accept: "application/json" } }
    );
  });

  it("raises a not-found ApiError for a missing entry", async () => {
    const api = clientWith(async () =>
      jsonResponse({ error: "entry_not_found" }, 404)
    );

    await expect(api.get(entry.id)).rejects.toMatchObject({
      name: "ApiError",
      code: "entry_not_found",
      status: 404,
    });
  });

  it("posts a new entry as JSON and parses the response", async () => {
    const fetchMock = vi.fn(async (_input: string, _init?: RequestInit) =>
      jsonResponse(entry, 201)
    );

    const created = await clientWith(fetchMock, "http://api.test/").create({
      rawText: "hello",
      source: "text",
    });

    expect(created).toEqual(entry);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/entries");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      accept: "application/json",
      "content-type": "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      rawText: "hello",
      source: "text",
    });
  });

  it("raises an ApiError with the API error code", async () => {
    const api = clientWith(async () =>
      jsonResponse({ error: "invalid_entry" }, 400)
    );

    await expect(api.create({ rawText: " ", source: "text" })).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        code: "invalid_entry",
        status: 400,
      })
    );
  });

  it("raises a network_error when the API is unreachable", async () => {
    const api = clientWith(async () => {
      throw new TypeError("Failed to fetch");
    });

    const error = await api.list().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "network_error", status: 0 });
  });

  it("falls back to http_error for a non-JSON error body", async () => {
    const api = clientWith(async () => new Response("boom", { status: 500 }));

    await expect(api.list()).rejects.toMatchObject({
      code: "http_error",
      status: 500,
    });
  });

  it("rejects a response that does not match the shared schema", async () => {
    const api = clientWith(async () =>
      jsonResponse({ entries: [{ id: "not-an-entry" }] })
    );

    await expect(api.list()).rejects.toThrowError();
  });
});
