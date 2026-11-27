import { loadSherpa, recognizerConfig } from "./sherpa.js";

const MODEL_DIR = process.env.MEMENTO_MODELS_DIR ?? "./data/models";
const THREADS = Number(process.env.TRANSCRIBE_THREADS ?? 4);
interface Request {
  id: string;
  wavPath: string;
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
    const request = message as Request;
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
      reply({ id: request.id, error: (error as Error).message });
    }
  });
} catch (error) {
  reply({ ready: false, error: (error as Error).message });
}
