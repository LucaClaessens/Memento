import { CreateEntrySchema } from "@memento/shared";
import { Hono } from "hono";
import { z } from "zod";
import type { EntriesRepository } from "../db/entries.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const parentIdSchema = z.string().uuid();

function parseLimit(value: string | undefined): number | null {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const limit = Number(value);
  return limit >= 1 && limit <= MAX_LIMIT ? limit : null;
}

/** Absent, empty, or the literal "null" means roots; anything else must be a UUID. */
function parseParentId(value: string | undefined): string | null | "invalid" {
  if (value === undefined || value === "" || value === "null") {
    return null;
  }

  const parsed = parentIdSchema.safeParse(value);
  return parsed.success ? parsed.data : "invalid";
}

export function entries(repository: EntriesRepository): Hono {
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

      const { id, rawText, source, createdAt, parentId } = parsed.data;
      const entryId = id ?? crypto.randomUUID();

      // Idempotent retries win over parent validation: the entry already exists.
      const existing = repository.get(entryId);
      if (existing) {
        return c.json(existing, 200);
      }

      if (parentId) {
        if (parentId === entryId) {
          return c.json(
            {
              error: "invalid_parent",
              issues: [
                {
                  path: "parentId",
                  message: "An entry cannot be its own parent.",
                },
              ],
            },
            400
          );
        }

        if (!repository.get(parentId)) {
          return c.json({ error: "parent_not_found" }, 404);
        }
      }

      const result = repository.create({
        id: entryId,
        rawText,
        source,
        createdAt: new Date(createdAt ?? Date.now()).toISOString(),
        parentId: parentId ?? null,
      });

      return c.json(result.entry, result.created ? 201 : 200);
    })
    .get("/", (c) => {
      const limit = parseLimit(c.req.query("limit"));
      if (limit === null) {
        return c.json({ error: "invalid_limit" }, 400);
      }

      const parentId = parseParentId(c.req.query("parentId"));
      if (parentId === "invalid") {
        return c.json({ error: "invalid_parent_id" }, 400);
      }

      return c.json({ entries: repository.list(limit, parentId) });
    })
    .get("/:id", (c) => {
      const entry = repository.get(c.req.param("id"));
      if (!entry) {
        return c.json({ error: "entry_not_found" }, 404);
      }

      return c.json(entry);
    });
}
