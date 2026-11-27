# All AI processing runs locally; no external AI APIs

Memento handles health-adjacent personal data and the user treats it as sensitive.
Transcription (Parakeet TDT 0.6B v3 via sherpa-onnx), extraction, and weekly-review generation (Ollama) all
run on the user's own Mac Mini; no raw text, audio, names, or medical details leave the
local network. The only network traffic is phone↔Mac Mini over Tailscale. This rules
out hosted transcription/LLM services even when convenient, and is the reason we accept
the operational cost of running and updating local models.

Considered Options: hosted APIs (e.g. Whisper API) with redaction — rejected because
redaction of names/medical details is error-prone and provider terms still need review;
local-only removes the question entirely.

Consequences: model quality and speed are bounded by the Mac Mini (M2, 16 GB);
transcription and digest generation are async background jobs, never on the critical
capture path.
