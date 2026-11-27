import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import type { Transcriber } from "../ai/transcriber.js";

export type ConvertAudio = (
  inputPath: string,
  outputPath: string
) => Promise<void>;

export interface TranscriptionServiceOptions {
  /** The worker that turns a WAV file into text. */
  transcriber: Pick<Transcriber, "transcribe">;
  /** Converts the upload to the worker's 16 kHz mono WAV. */
  convert?: ConvertAudio;
  ffmpegBin?: string;
  tempDir?: string;
  newId?: () => string;
}

export interface TranscriptionService {
  /** Convert an uploaded audio blob to WAV and transcribe it on the worker. */
  transcribe(inputPath: string): Promise<string>;
}

async function convertWithFfmpeg(
  ffmpegBin: string,
  inputPath: string,
  outputPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      ffmpegBin,
      ["-y", "-i", inputPath, "-ar", "16000", "-ac", "1", outputPath],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited ${code}: ${stderr.trim()}`));
      }
    });
  });
}

export function createTranscriptionService({
  transcriber,
  convert,
  ffmpegBin = process.env.FFMPEG_BIN ?? "ffmpeg",
  tempDir = tmpdir(),
  newId = () => crypto.randomUUID(),
}: TranscriptionServiceOptions): TranscriptionService {
  const convertAudio =
    convert ?? ((input, output) => convertWithFfmpeg(ffmpegBin, input, output));

  return {
    async transcribe(inputPath) {
      const wavPath = join(tempDir, `memento-${newId()}.wav`);
      try {
        await convertAudio(inputPath, wavPath);
        return await transcriber.transcribe(wavPath);
      } finally {
        await rm(wavPath, { force: true }).catch(() => undefined);
      }
    },
  };
}
