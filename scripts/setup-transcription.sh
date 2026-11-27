#!/usr/bin/env bash
set -euo pipefail

# Bootstrap local transcription: Parakeet TDT 0.6B v3 (int8) model files.
# The sherpa-onnx native addon ships with @memento/api via npm.
# Run from the repo root: ./scripts/setup-transcription.sh
# Models live in apps/api/data/models (gitignored).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_DIR="${MEMENTO_MODELS_DIR:-$ROOT/apps/api/data/models}/parakeet-tdt-0.6b-v3"
MODEL_BASE="https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/resolve/main"

mkdir -p "$MODEL_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg" >&2
  exit 1
fi

for f in encoder.int8.onnx decoder.int8.onnx joiner.int8.onnx tokens.txt; do
  if [ ! -f "$MODEL_DIR/$f" ]; then
    echo "Downloading $f ..."
    curl -fL -o "$MODEL_DIR/$f" "$MODEL_BASE/$f"
  fi
done

echo "Ready. Set MEMENTO_MODELS_DIR in apps/api/.env if you use a custom path."
echo "Optional: TRANSCRIBE_THREADS (default 4)."
