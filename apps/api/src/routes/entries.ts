import { CreateEntrySchema } from "@memento/shared";
import { Hono } from "hono";
import { createEntriesRepository } from "../db/entries.js";
import type { Db } from "../db/types.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseLimit(value: string | undefined): number | null {
  if (value === undefined) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) return null;

  const limit = Number(value);
  return limit >= 1 && limit <= MAX_LIMIT ? limit : null;
}

export function entries(db: Db): Hono {
  const repository = createEntriesRepository(db);

  return new Hono()
    .post("/", async (c) => {
      if (!c.req.header("content-type")?.includes("application/json")) {
        return c.json({ error: "invalid_content_type" }, 415);
      }

      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        return c.json({ error: "invalid_json" }, 400);
      }

      const parsed = CreateEntrySchema.safeParse(body);
      if (!parsed.success) {
        return c.json(
          {
            error: "invalid_entry",
            issues: parsed.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          400
        );
      }

      const { id, rawText, source, createdAt } = parsed.data;
      const result = repository.create({
        id: id ?? crypto.randomUUID(),
        rawText,
        source,
        createdAt: new Date(createdAt ?? Date.now()).toISOString(),
      });

      return c.json(result.entry, result.created ? 201 : 200);
    })
    .get("/", (c) => {
      const limit = parseLimit(c.req.query("limit"));
      if (limit === null) {
        return c.json({ error: "invalid_limit" }, 400);
      }

      return c.json({ entries: repository.list(limit) });
    });
}
