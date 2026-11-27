import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { TranscriberUnavailableError } from "../ai/transcriber.js";
import { createTranscriptionService } from "./transcription.js";

const tempDirs: Array<string> = [];

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "memento-transcription-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await rm(dir, { recursive: true, force: true });
  }
});

describe("transcription service", () => {
  it("converts the upload, transcribes the WAV, and removes it", async () => {
    const dir = await tempDir();
    const calls: Array<string> = [];
    const service = createTranscriptionService({
      transcriber: {
        async transcribe(wavPath) {
          calls.push(wavPath);
          return "hello there";
        },
      },
      convert: async (_input, output) => {
        await writeFile(output, "wav bytes");
      },
      tempDir: dir,
    });

    const text = await service.transcribe("/uploads/recording.webm");

    expect(text).toBe("hello there");
    expect(calls).toHaveLength(1);
    expect(existsSync(calls[0])).toBe(false);
  });

  it("removes the WAV when transcription fails", async () => {
    const dir = await tempDir();
    let wavPath = "";
    const service = createTranscriptionService({
      transcriber: {
        async transcribe(path) {
          wavPath = path;
          throw new Error("worker down");
        },
      },
      convert: async (_input, output) => {
        await writeFile(output, "wav bytes");
      },
      tempDir: dir,
    });

    await expect(service.transcribe("/uploads/recording.webm")).rejects.toThrow(
      "worker down"
    );
    expect(wavPath).not.toBe("");
    expect(existsSync(wavPath)).toBe(false);
  });

  it("passes an unavailable transcriber error through unchanged", async () => {
    const dir = await tempDir();
    const service = createTranscriptionService({
      transcriber: {
        async transcribe() {
          throw new TranscriberUnavailableError();
        },
      },
      convert: async (_input, output) => {
        await writeFile(output, "wav bytes");
      },
      tempDir: dir,
    });

    await expect(
      service.transcribe("/uploads/recording.webm")
    ).rejects.toBeInstanceOf(TranscriberUnavailableError);
  });
});
