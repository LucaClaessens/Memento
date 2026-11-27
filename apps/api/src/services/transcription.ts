import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { transcribe } from "../ai/transcribe.js";

const FFMPEG_BIN = process.env.FFMPEG_BIN ?? "ffmpeg";

async function convertToWav(
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

/** Convert an uploaded audio blob to WAV and transcribe it locally. */
export async function transcribeAudio(inputPath: string): Promise<string> {
  const wavPath = join(tmpdir(), `memento-${randomUUID()}.wav`);
  try {
    await convertToWav(inputPath, wavPath);
    return await transcribe(wavPath);
  } finally {
    await rm(wavPath, { force: true }).catch(() => undefined);
  }
}
