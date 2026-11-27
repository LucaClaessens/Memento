import { describe, expect, it } from "vitest";
import { TranscriberUnavailableError } from "../ai/transcriber.js";
import { createApp } from "../app.js";
import { openDatabase } from "../db/index.js";

function setup(transcribe?: (path: string) => Promise<string>) {
  return createApp({
    db: openDatabase(":memory:"),
    allowedOrigins: ["http://localhost:5173"],
    transcription: transcribe ? { transcribe } : undefined,
  });
}

function audioForm(): FormData {
  const form = new FormData();
  form.append("audio", new File([new Uint8Array([1, 2, 3])], "a.webm"));
  return form;
}

describe("POST /transcribe", () => {
  it("requires multipart form data", async () => {
    const response = await setup().request("/transcribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });

    expect(response.status).toBe(415);
    expect(((await response.json()) as { error: string }).error).toBe(
      "invalid_content_type"
    );
  });

  it("requires an audio file", async () => {
    const form = new FormData();
    form.append("nope", "x");
    const response = await setup().request("/transcribe", {
      method: "POST",
      body: form,
    });

    expect(response.status).toBe(400);
    expect(((await response.json()) as { error: string }).error).toBe(
      "missing_audio"
    );
  });

  it("returns the transcript from the transcription service", async () => {
    const response = await setup(async () => "hello there").request(
      "/transcribe",
      { method: "POST", body: audioForm() }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ rawText: "hello there" });
  });

  it("maps an unavailable transcriber to 503", async () => {
    const response = await setup(async () => {
      throw new TranscriberUnavailableError();
    }).request("/transcribe", { method: "POST", body: audioForm() });

    expect(response.status).toBe(503);
    expect(((await response.json()) as { error: string }).error).toBe(
      "transcriber_unavailable"
    );
  });

  it("reports a transcription failure as a 500 with its message", async () => {
    const response = await setup(async () => {
      throw new Error("worker down");
    }).request("/transcribe", { method: "POST", body: audioForm() });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "transcription_failed",
      message: "worker down",
    });
  });

  it("rejects an oversized upload", async () => {
    const form = new FormData();
    form.append(
      "audio",
      new File([new Uint8Array(26 * 1024 * 1024)], "a.webm")
    );
    const response = await setup().request("/transcribe", {
      method: "POST",
      body: form,
    });

    expect(response.status).toBe(413);
  });
});
