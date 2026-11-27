import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { openDatabase } from "../db/index.js";

function setup() {
  return createApp({
    db: openDatabase(":memory:"),
    allowedOrigins: ["http://localhost:5173"],
  });
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
