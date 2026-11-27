import { describe, expect, it } from "vitest";
import { recognizerConfig } from "./sherpa.js";

describe("recognizerConfig", () => {
  it("points at the Parakeet model files with the requested thread count", () => {
    const config = recognizerConfig("/models", 4) as {
      featConfig: { sampleRate: number; featureDim: number };
      modelConfig: {
        transducer: Record<string, string>;
        tokens: string;
        numThreads: number;
        modelType: string;
      };
    };

    expect(config.featConfig).toEqual({ sampleRate: 16_000, featureDim: 80 });
    expect(config.modelConfig.transducer).toEqual({
      encoder: "/models/parakeet-tdt-0.6b-v3/encoder.int8.onnx",
      decoder: "/models/parakeet-tdt-0.6b-v3/decoder.int8.onnx",
      joiner: "/models/parakeet-tdt-0.6b-v3/joiner.int8.onnx",
    });
    expect(config.modelConfig.tokens).toBe(
      "/models/parakeet-tdt-0.6b-v3/tokens.txt"
    );
    expect(config.modelConfig.numThreads).toBe(4);
    expect(config.modelConfig.modelType).toBe("nemo_transducer");
  });
});
