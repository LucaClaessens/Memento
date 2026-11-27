import { describe, expect, it } from "vitest";
import { parseSherpaOutput } from "./transcribe.js";

describe("parseSherpaOutput", () => {
  it("reads the JSON result line from sherpa-onnx 2.x", () => {
    const stdout = `num threads: 2
{"lang": "", "text": "Ask not what your country can do for you.", "words": []}
`;
    expect(parseSherpaOutput(stdout)).toBe(
      "Ask not what your country can do for you."
    );
  });

  it("supports older text: output", () => {
    expect(parseSherpaOutput("text: hello world\n")).toBe("hello world");
  });

  it("returns an empty transcript for empty text", () => {
    expect(parseSherpaOutput('{"text": ""}')).toBe("");
  });
});
