import { spawn } from "node:child_process";
import { rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { createEntriesRepository } from "../db/entries.js";
import type { Db } from "../db/types.js";
import { transcribe } from "../ai/transcribe.js";

const FFMPEG_BIN = process.env.FFMPEG_BIN ?? "ffmpeg";

export async function convertToWav(
  inputPath: string,
  outputPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      FFMPEG_BIN,
      ["-y", "-i", inputPath, "-ar", "16000", "-ac", "1", outputPath],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.trim()}`));
    });
  });
}

export async function runTranscription(
  db: Db,
  entryId: string,
  audioDir: string
): Promise<void> {
  const repo = createEntriesRepository(db);
  const entry = repo.get(entryId);
  if (!entry || !entry.audioPath) return;

  const audioPath = join(audioDir, entry.audioPath);
  const wavPath = join(tmpdir(), `memento-${randomUUID()}.wav`);

  try {
    await convertToWav(audioPath, wavPath);
    const text = await transcribe(wavPath);
    if (!text.trim()) {
      throw new Error("empty transcript");
    }
    repo.updateTranscription(entryId, "done", text, null);
    // Delete audio on success.
    try {
      await unlink(audioPath);
    } catch {
      // ignore
    }
    repo.setAudioPath(entryId, null);
  } catch (err) {
    repo.updateTranscription(entryId, "failed", undefined, undefined);
    // keep audio for retry
    void err;
  } finally {
    await rm(wavPath, { force: true }).catch(() => undefined);
  }
}
