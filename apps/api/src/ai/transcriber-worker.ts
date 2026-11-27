import { errorMessage } from "../errors.js";
import { loadSherpa, recognizerConfig } from "./sherpa.js";

const MODEL_DIR = process.env.MEMENTO_MODELS_DIR ?? "./data/models";
const THREADS = Number(process.env.TRANSCRIBE_THREADS ?? 4);
interface TranscribeRequest {
  id: string;
  wavPath: string;
}

function isTranscribeRequest(message: unknown): message is TranscribeRequest {
  return (
    typeof message === "object" &&
    message !== null &&
    "id" in message &&
    typeof message.id === "string" &&
    "wavPath" in message &&
    typeof message.wavPath === "string"
  );
}

function reply(message: unknown): void {
  process.send?.(message);
}

try {
  const sherpa = loadSherpa();
  const recognizer = new sherpa.OfflineRecognizer(
    recognizerConfig(MODEL_DIR, THREADS)
  );
  reply({ ready: true, version: sherpa.version });

  process.on("message", (message: unknown) => {
    if (!isTranscribeRequest(message)) {
      return;
    }
    const request = message;
    try {
      const wave = sherpa.readWave(request.wavPath);
      const stream = recognizer.createStream();
      stream.acceptWaveform({
        sampleRate: wave.sampleRate,
        samples: wave.samples,
      });
      recognizer.decode(stream);
      const result = recognizer.getResult(stream);
      reply({ id: request.id, text: result.text });
    } catch (error) {
      reply({ id: request.id, error: errorMessage(error) });
    }
  });
} catch (error) {
  reply({ ready: false, error: errorMessage(error) });
}
