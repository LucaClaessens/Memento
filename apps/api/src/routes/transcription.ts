import { Hono } from "hono";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { transcribeAudio } from "../services/transcription.js";
import { TranscriberUnavailableError } from "../ai/transcriber.js";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export function transcription(): Hono {
  return new Hono().post("/", async (c) => {
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

    const dir = join(tmpdir(), `memento-upload-${randomUUID()}`);
    await mkdir(dir, { recursive: true });
    const path = join(dir, "audio.webm");
    await writeFile(path, new Uint8Array(await audio.arrayBuffer()));

    try {
      const rawText = await transcribeAudio(path);
      return c.json({ rawText });
    } catch (err) {
      if (err instanceof TranscriberUnavailableError) {
        return c.json({ error: "transcriber_unavailable" }, 503);
      }
      return c.json(
        { error: "transcription_failed", message: (err as Error).message },
        500
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}
