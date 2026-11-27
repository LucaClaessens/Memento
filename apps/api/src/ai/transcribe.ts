import { spawn } from "node:child_process";

export const SHERPA_ONNX_BIN =
  process.env.SHERPA_ONNX_BIN ?? "sherpa-onnx-offline";

export const MODELS_DIR = process.env.MEMENTO_MODELS_DIR ?? "./data/models";

export const PARAKEET_MODEL_DIR = `${MODELS_DIR}/parakeet-tdt-0.6b-v3`;

/** sherpa-onnx 2.x prints a JSON result line; older builds print "text: ...". */
export function parseSherpaOutput(stdout: string): string {
  const jsonLine = stdout
    .split("\n")
    .map((line) => line.trim())
    .reverse()
    .find((line) => line.startsWith("{"));
  if (jsonLine) {
    try {
      const parsed = JSON.parse(jsonLine) as { text?: string };
      return (parsed.text ?? "").trim();
    } catch {
      // fall through
    }
  }
  const match = stdout.match(/text:\s*([\s\S]*?)(?:\n\s*\n|$)/i);
  return (match ? match[1] : stdout).trim();
}

/**
 * Transcribe a 16 kHz mono WAV file with Parakeet TDT 0.6B v3 via sherpa-onnx.
 * Runs as a local process; never on the capture path.
 */
export async function transcribe(audioPath: string): Promise<string> {
  const args = [
    `--tokens=${PARAKEET_MODEL_DIR}/tokens.txt`,
    `--encoder=${PARAKEET_MODEL_DIR}/encoder.int8.onnx`,
    `--decoder=${PARAKEET_MODEL_DIR}/decoder.int8.onnx`,
    `--joiner=${PARAKEET_MODEL_DIR}/joiner.int8.onnx`,
    "--num-threads=2",
    audioPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(SHERPA_ONNX_BIN, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`sherpa-onnx exited ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(parseSherpaOutput(stdout));
    });
  });
}
