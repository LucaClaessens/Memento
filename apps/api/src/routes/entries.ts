import { CreateEntrySchema } from "@memento/shared";
import { Hono } from "hono";
import { z } from "zod";
import { createEntriesRepository } from "../db/entries.js";
import type { Db } from "../db/types.js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, extname } from "node:path";
import { runTranscription } from "../services/transcription.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const parentIdSchema = z.string().uuid();

function parseLimit(value: string | undefined): number | null {
  if (value === undefined) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) return null;

  const limit = Number(value);
  return limit >= 1 && limit <= MAX_LIMIT ? limit : null;
}

/** Absent, empty, or the literal "null" means roots; anything else must be a UUID. */
function parseParentId(value: string | undefined): string | null | "invalid" {
  if (value === undefined || value === "" || value === "null") return null;

  const parsed = parentIdSchema.safeParse(value);
  return parsed.success ? parsed.data : "invalid";
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const AUDIO_DIR = process.env.MEMENTO_AUDIO_DIR ?? "./data/audio";

function audioExt(file: File): string {
  const fromName = extname(file.name);
  if (fromName) return fromName;
  if (file.type === "audio/webm") return ".webm";
  if (file.type === "audio/ogg") return ".ogg";
  if (file.type === "audio/mp4") return ".m4a";
  if (file.type === "audio/wav") return ".wav";
  return ".bin";
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

      const { id, rawText, source, createdAt, parentId, transcriptionStatus } =
        parsed.data;
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
        transcriptionStatus: transcriptionStatus ?? "done",
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
    .post("/voice", async (c) => {
      const contentType = c.req.header("content-type") ?? "";
      if (!contentType.includes("multipart/form-data")) {
        return c.json({ error: "invalid_content_type" }, 415);
      }

      let body: Record<string, unknown>;
      try {
        body = await c.req.parseBody();
      } catch {
        return c.json({ error: "invalid_multipart" }, 400);
      }

      const audio = body["audio"];
      if (!(audio instanceof File)) {
        return c.json({ error: "missing_audio" }, 400);
      }
      if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
        return c.json({ error: "audio_too_large" }, 413);
      }

      const id =
        typeof body["id"] === "string" && body["id"]
          ? body["id"]
          : crypto.randomUUID();
      const createdAt =
        typeof body["createdAt"] === "string" && body["createdAt"]
          ? body["createdAt"]
          : new Date().toISOString();
      const parentId =
        typeof body["parentId"] === "string" && body["parentId"]
          ? body["parentId"]
          : null;

      const existing = repository.get(id);
      if (existing) {
        return c.json(existing, 200);
      }

      if (parentId) {
        if (parentId === id) {
          return c.json({ error: "invalid_parent" }, 400);
        }
        if (!repository.get(parentId)) {
          return c.json({ error: "parent_not_found" }, 404);
        }
      }

      const ext = audioExt(audio);
      const relPath = `${id}${ext}`;
      const fullPath = join(AUDIO_DIR, relPath);
      await mkdir(dirname(fullPath), { recursive: true });
      const bytes = new Uint8Array(await audio.arrayBuffer());
      await writeFile(fullPath, bytes);

      const result = repository.create({
        id,
        rawText: "",
        source: "voice",
        createdAt: new Date(createdAt).toISOString(),
        parentId: parentId ?? null,
        transcriptionStatus: "pending",
        audioPath: relPath,
      });

      // Kick off async transcription (never on capture path).
      void runTranscription(db, id, AUDIO_DIR).catch(() => undefined);

      return c.json(result.entry, result.created ? 201 : 200);
    })
    .post("/:id/transcribe", async (c) => {
      const entry = repository.get(c.req.param("id"));
      if (!entry) {
        return c.json({ error: "entry_not_found" }, 404);
      }
      if (!entry.audioPath) {
        return c.json({ error: "no_audio" }, 400);
      }
      if (entry.transcriptionStatus === "pending") {
        return c.json(entry, 200);
      }
      repository.updateTranscription(
        entry.id,
        "pending",
        entry.rawText,
        entry.title
      );
      void runTranscription(db, entry.id, AUDIO_DIR).catch(() => undefined);
      const updated = repository.get(entry.id);
      return c.json(updated, 200);
    })
    .get("/:id", (c) => {
      const entry = repository.get(c.req.param("id"));
      if (!entry) {
        return c.json({ error: "entry_not_found" }, 404);
      }

      return c.json(entry);
    });
}
