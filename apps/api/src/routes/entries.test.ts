import { EntryListSchema, EntrySchema } from "@memento/shared";
import type { Entry } from "@memento/shared";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { openDatabase } from "../db/index.js";

function setup() {
  return createApp({
    db: openDatabase(":memory:"),
    allowedOrigins: ["http://localhost:5173"],
  });
}

async function post(
  app: ReturnType<typeof createApp>,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  return app.request("/entries", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function createEntry(
  app: ReturnType<typeof createApp>,
  body: unknown
): Promise<Entry> {
  const response = await post(app, body);
  expect(response.status).toBe(201);
  return EntrySchema.parse(await response.json());
}

interface ErrorBody {
  error: string;
  issues?: Array<{ path: string; message: string }>;
}

describe("POST /entries", () => {
  it("creates an entry, preserving the text exactly", async () => {
    const app = setup();

    const response = await post(app, { rawText: "  hello\nworld  " });
    const entry = EntrySchema.parse(await response.json());

    expect(response.status).toBe(201);
    expect(entry.rawText).toBe("  hello\nworld  ");
    expect(entry.source).toBe("text");
    expect(entry.parentId).toBeNull();
    expect(entry.title).toBe("hello");
    expect(entry.summary).toBeNull();
    expect(entry.titleSource).toBe("first_line");
    expect(entry.synced).toBe(true);
    expect(entry.syncedAt).toBe(entry.createdAt);
  });

  it("accepts a client-generated id and createdAt", async () => {
    const app = setup();
    const id = "11111111-1111-4111-8111-111111111111";

    const entry = await createEntry(app, {
      id,
      rawText: "captured offline",
      createdAt: "2026-11-25T10:00:00.000Z",
    });

    expect(entry.id).toBe(id);
    expect(entry.createdAt).toBe("2026-11-25T10:00:00.000Z");
  });

  it("is idempotent by id: a retry returns the stored entry", async () => {
    const app = setup();
    const id = "22222222-2222-4222-8222-222222222222";

    const first = await post(app, { id, rawText: "first" });
    const firstEntry = EntrySchema.parse(await first.json());
    const second = await post(app, { id, rawText: "second" });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(firstEntry);

    const list = EntryListSchema.parse(
      await (await app.request("/entries")).json()
    );
    expect(list.entries).toEqual([firstEntry]);
  });

  it.each([
    [{}, "rawText"],
    [{ rawText: "   " }, "rawText"],
    [{ rawText: "a".repeat(10_001) }, "rawText"],
    [{ rawText: "hi", id: "nope" }, "id"],
    [{ rawText: "hi", source: "audio" }, "source"],
    [{ rawText: "hi", createdAt: "yesterday" }, "createdAt"],
  ])("rejects an invalid payload (%#)", async (body, path) => {
    const response = await post(setup(), body);
    const payload = (await response.json()) as ErrorBody;

    expect(response.status).toBe(400);
    expect(payload.error).toBe("invalid_entry");
    expect(payload.issues?.map((issue) => issue.path)).toContain(path);
  });

  it("rejects malformed JSON", async () => {
    const response = await post(setup(), "{not json");

    expect(response.status).toBe(400);
    expect(((await response.json()) as ErrorBody).error).toBe("invalid_json");
  });

  it("requires a JSON content type", async () => {
    const response = await post(setup(), JSON.stringify({ rawText: "hi" }), {
      "content-type": "text/plain",
    });

    expect(response.status).toBe(415);
    expect(((await response.json()) as ErrorBody).error).toBe(
      "invalid_content_type"
    );
  });
});

describe("GET /entries", () => {
  it("lists newest first and honours the limit", async () => {
    const app = setup();
    await createEntry(app, {
      rawText: "oldest",
      createdAt: "2026-11-25T09:00:00Z",
    });
    await createEntry(app, {
      rawText: "newest",
      createdAt: "2026-11-25T11:00:00Z",
    });
    await createEntry(app, {
      rawText: "middle",
      createdAt: "2026-11-25T10:00:00Z",
    });

    const all = EntryListSchema.parse(
      await (await app.request("/entries")).json()
    );
    const limited = EntryListSchema.parse(
      await (await app.request("/entries?limit=2")).json()
    );

    expect(all.entries.map((entry) => entry.rawText)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
    expect(limited.entries.map((entry) => entry.rawText)).toEqual([
      "newest",
      "middle",
    ]);
  });

  it.each(["0", "201", "abc", "1.5", "-1", ""])(
    "rejects limit=%j",
    async (limit) => {
      const response = await setup().request(`/entries?limit=${limit}`);

      expect(response.status).toBe(400);
      expect(((await response.json()) as ErrorBody).error).toBe(
        "invalid_limit"
      );
    }
  );

  it("returns an empty list before anything is captured", async () => {
    const response = await setup().request("/entries");

    expect(await response.json()).toEqual({ entries: [] });
  });
});

describe("threads", () => {
  it("creates a follow-up, hides it from roots, and lists it for the parent", async () => {
    const app = setup();
    const parent = await createEntry(app, { rawText: "the original" });
    const child = await createEntry(app, {
      rawText: "a follow-up",
      parentId: parent.id,
    });

    expect(child.parentId).toBe(parent.id);
    expect(child.title).toBe("a follow-up");

    const roots = EntryListSchema.parse(
      await (await app.request("/entries")).json()
    );
    const children = EntryListSchema.parse(
      await (await app.request(`/entries?parentId=${parent.id}`)).json()
    );

    expect(roots.entries.map((entry) => entry.id)).toEqual([parent.id]);
    expect(children.entries.map((entry) => entry.id)).toEqual([child.id]);
  });

  it("treats parentId=null and an empty parentId as roots", async () => {
    const app = setup();
    const root = await createEntry(app, { rawText: "root" });

    for (const query of ["parentId=null", "parentId="]) {
      const list = EntryListSchema.parse(
        await (await app.request(`/entries?${query}`)).json()
      );
      expect(list.entries.map((entry) => entry.id)).toEqual([root.id]);
    }
  });

  it("rejects an invalid parentId query", async () => {
    const response = await setup().request("/entries?parentId=nope");

    expect(response.status).toBe(400);
    expect(((await response.json()) as ErrorBody).error).toBe(
      "invalid_parent_id"
    );
  });

  it("rejects a self-parent", async () => {
    const id = "55555555-5555-4555-8555-555555555555";

    const response = await post(setup(), {
      id,
      rawText: "self",
      parentId: id,
    });

    expect(response.status).toBe(400);
    expect(((await response.json()) as ErrorBody).error).toBe("invalid_parent");
  });

  it("rejects an unknown parent", async () => {
    const response = await post(setup(), {
      rawText: "orphan",
      parentId: "99999999-9999-4999-8999-999999999999",
    });

    expect(response.status).toBe(404);
    expect(((await response.json()) as ErrorBody).error).toBe(
      "parent_not_found"
    );
  });

  it("lists a parent's follow-ups newest first", async () => {
    const app = setup();
    const parent = await createEntry(app, { rawText: "root" });
    const older = await createEntry(app, {
      rawText: "older",
      parentId: parent.id,
      createdAt: "2026-11-25T09:00:00Z",
    });
    const newer = await createEntry(app, {
      rawText: "newer",
      parentId: parent.id,
      createdAt: "2026-11-25T11:00:00Z",
    });

    const children = EntryListSchema.parse(
      await (await app.request(`/entries?parentId=${parent.id}`)).json()
    );

    expect(children.entries.map((entry) => entry.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });

  it("returns a single entry and 404 for an unknown id", async () => {
    const app = setup();
    const entry = await createEntry(app, { rawText: "one" });

    const found = await app.request(`/entries/${entry.id}`);
    const missing = await app.request(
      "/entries/99999999-9999-4999-8999-999999999999"
    );

    expect(found.status).toBe(200);
    expect(EntrySchema.parse(await found.json())).toEqual(entry);
    expect(missing.status).toBe(404);
    expect(((await missing.json()) as ErrorBody).error).toBe("entry_not_found");
  });

  it("returns the stored entry on an idempotent retry with a parent", async () => {
    const app = setup();
    const parent = await createEntry(app, { rawText: "root" });
    const id = "66666666-6666-4666-8666-666666666666";

    const first = await post(app, {
      id,
      rawText: "child",
      parentId: parent.id,
    });
    const firstEntry = EntrySchema.parse(await first.json());
    const second = await post(app, {
      id,
      rawText: "a different retry",
      parentId: parent.id,
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(firstEntry);
  });
});

describe("CORS", () => {
  it("answers a preflight from the configured web origin", async () => {
    const response = await setup().request("/entries", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type",
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173"
    );
  });

  it("does not echo an unknown origin", async () => {
    const response = await setup().request("/entries", {
      method: "OPTIONS",
      headers: {
        origin: "http://evil.example",
        "access-control-request-method": "POST",
      },
    });

    expect(response.headers.get("access-control-allow-origin")).not.toBe(
      "http://evil.example"
    );
  });
});
