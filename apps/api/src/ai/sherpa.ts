import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export interface SherpaStream {
  acceptWaveform(wave: { sampleRate: number; samples: Float32Array }): void;
}

export interface SherpaResult {
  text: string;
}

export interface SherpaRecognizer {
  createStream(): SherpaStream;
  decode(stream: SherpaStream): void;
  getResult(stream: SherpaStream): SherpaResult;
}

export interface SherpaModule {
  OfflineRecognizer: new (config: unknown) => SherpaRecognizer;
  readWave(path: string): { sampleRate: number; samples: Float32Array };
  version: string;
}

/** The npm addon is CommonJS; load it once per process through createRequire. */
export function loadSherpa(): SherpaModule {
  return require("sherpa-onnx-node") as SherpaModule;
}

export function recognizerConfig(modelsDir: string, threads: number) {
  const modelDir = `${modelsDir.replace(/\/$/, "")}/parakeet-tdt-0.6b-v3`;
  return {
    featConfig: { sampleRate: 16_000, featureDim: 80 },
    modelConfig: {
      transducer: {
        encoder: `${modelDir}/encoder.int8.onnx`,
        decoder: `${modelDir}/decoder.int8.onnx`,
        joiner: `${modelDir}/joiner.int8.onnx`,
      },
      tokens: `${modelDir}/tokens.txt`,
      numThreads: threads,
      provider: "cpu",
      debug: 0,
      modelType: "nemo_transducer",
    },
  };
}
