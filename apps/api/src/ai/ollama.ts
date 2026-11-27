import { z } from "zod";

const GenerateResponseSchema = z.object({ response: z.string() });

// Ollama adapter (local LLM). Base URL defaults to local Ollama.
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export async function ollamaGenerate(
  prompt: string,
  model = "llama3.2"
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }
  // A body without a string `response` is a contract violation; fail loudly
  // instead of returning undefined to a caller that expects text.
  return GenerateResponseSchema.parse(await res.json()).response;
}
