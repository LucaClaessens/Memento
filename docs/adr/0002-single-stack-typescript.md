# Backend is TypeScript/Node (Hono), not Python, despite being ML-heavy

The frontend is SvelteKit/TypeScript. Keeping the backend in the same language gives one
toolchain, shared zod schemas and types via `packages/shared`, and lower context-switching
for a solo developer. The ML surface is thin and "binary/HTTP-call shaped":
transcription is whisper.cpp (a CLI), and extraction plus digest are prompts to a local
Ollama HTTP API — so Python's ML ecosystem advantage is mostly convenience here, not
capability. A Python sidecar remains an option if we later need in-process ML
(embeddings, NLP). Transcription runs in a persistent Node worker using the
native `sherpa-onnx-node` addon so the model is loaded once; this keeps the
implementation in TypeScript without introducing Python.

Considered Options: Python/FastAPI — rejected for v1 because its advantage
(faster-whisper in-process, prompt tooling) does not outweigh single-stack simplicity
for this scope.
