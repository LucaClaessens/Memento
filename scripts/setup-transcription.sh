#!/usr/bin/env bash
set -euo pipefail

# Bootstrap local transcription: sherpa-onnx CLI + Parakeet TDT 0.6B v3 (int8) model.
# Run from the repo root: ./scripts/setup-transcription.sh
# Nothing is committed: binaries/models live in .cache/ and data/ (gitignored).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT/.cache/sherpa-onnx"
MODEL_DIR="${MEMENTO_MODELS_DIR:-$ROOT/apps/api/data/models}/parakeet-tdt-0.6b-v3"
VERSION="2.0.3"
BASE="https://github.com/k2-fsa/sherpa-onnx/releases/download/v${VERSION}"
MODEL_BASE="https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/resolve/main"

mkdir -p "$BIN_DIR" "$MODEL_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with: brew install ffmpeg" >&2
  exit 1
fi

if [ ! -x "$BIN_DIR/sherpa-onnx-offline" ]; then
  echo "Downloading sherpa-onnx ${VERSION} (macOS arm64)..."
  TMP="$(mktemp -d)"
  curl -fL -o "$TMP/sherpa.tar.bz2" "$BASE/sherpa-onnx-v${VERSION}-osx-arm64-static.tar.bz2"
  tar -xjf "$TMP/sherpa.tar.bz2" -C "$TMP" "sherpa-onnx-v${VERSION}-osx-arm64-static/bin"
  cp "$TMP/sherpa-onnx-v${VERSION}-osx-arm64-static/bin/sherpa-onnx-offline" "$BIN_DIR/"
  chmod +x "$BIN_DIR/sherpa-onnx-offline"
  rm -rf "$TMP"
fi

for f in encoder.int8.onnx decoder.int8.onnx joiner.int8.onnx tokens.txt; do
  if [ ! -f "$MODEL_DIR/$f" ]; then
    echo "Downloading $f ..."
    curl -fL -o "$MODEL_DIR/$f" "$MODEL_BASE/$f"
  fi
done

echo "Ready. Set these in apps/api/.env (or export before pnpm dev):"
echo "  SHERPA_ONNX_BIN=$BIN_DIR/sherpa-onnx-offline"
echo "  MEMENTO_MODELS_DIR=$(dirname "$MODEL_DIR")"
