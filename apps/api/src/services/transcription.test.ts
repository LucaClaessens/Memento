import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
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
      newId: () => "fixed",
    });

    const text = await service.transcribe("/uploads/recording.webm");

    const wavPath = join(dir, "memento-fixed.wav");
    expect(text).toBe("hello there");
    expect(calls).toEqual([wavPath]);
    expect(existsSync(wavPath)).toBe(false);
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
      newId: () => "fixed",
    });

    await expect(service.transcribe("/uploads/recording.webm")).rejects.toThrow(
      "worker down"
    );
    expect(wavPath).toBe(join(dir, "memento-fixed.wav"));
    expect(existsSync(wavPath)).toBe(false);
  });
});
