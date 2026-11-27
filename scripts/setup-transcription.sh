#!/usr/bin/env bash
set -euo pipefail

# Downloads Parakeet TDT 0.6B v3 model files for sherpa-onnx and checks prerequisites.
# Run from the repo root: ./scripts/setup-transcription.sh

MODELS_DIR="${MEMENTO_MODELS_DIR:-./data/models}"
MODEL_DIR="$MODELS_DIR/parakeet-tdt-0.6b-v3"

mkdir -p "$MODEL_DIR"

if ! command -v sherpa-onnx-offline >/dev/null 2>&1; then
  echo "sherpa-onnx-offline not found on PATH."
  echo "Install sherpa-onnx from https://github.com/k2-fsa/sherpa-onnx/releases and add to PATH (or set SHERPA_ONNX_BIN)."
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found on PATH. Install via: brew install ffmpeg"
fi

echo "Download Parakeet TDT 0.6B v3 model files into $MODEL_DIR:"
echo "  encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt"
echo "See https://github.com/k2-fsa/sherpa-onnx for the model download links."
echo "Set MEMENTO_MODELS_DIR / SHERPA_ONNX_BIN in .env if you use custom paths."