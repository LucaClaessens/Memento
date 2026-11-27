import { Hono } from "hono";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { errorMessage } from "../errors.js";
import type { TranscriptionService } from "../services/transcription.js";
import { TranscriberUnavailableError } from "../ai/transcriber.js";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export function transcription(service: TranscriptionService): Hono {
  return new Hono().post("/", async (c) => {
    const contentType = c.req.header("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return c.json({ error: "invalid_content_type" }, 415);
    }

    let body: Record<string, string | File>;
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
      const rawText = await service.transcribe(path);
      return c.json({ rawText });
    } catch (error) {
      if (error instanceof TranscriberUnavailableError) {
        return c.json({ error: "transcriber_unavailable" }, 503);
      }
      return c.json(
        { error: "transcription_failed", message: errorMessage(error) },
        500
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}
