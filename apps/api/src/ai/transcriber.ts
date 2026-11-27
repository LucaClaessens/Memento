import { fork } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const isDev = import.meta.filename.includes("/src/");
const workerUrl = new URL(
  isDev ? "./transcriber-worker.ts" : "./transcriber-worker.js",
  import.meta.url
);

const REQUEST_TIMEOUT_MS = 30_000;

type Reply =
  | { ready: true; version: string }
  | { ready: false; error: string }
  | { id: string; text?: string; error?: string };

interface Pending {
  resolve: (text: string) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class TranscriberUnavailableError extends Error {
  constructor(message = "Transcriber unavailable") {
    super(message);
    this.name = "TranscriberUnavailableError";
  }
}

export function createTranscriber() {
  let child: ChildProcess | null = null;
  let ready = false;
  let startPromise: Promise<void> | null = null;
  const pending = new Map<string, Pending>();

  function failAll(message: string): void {
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      entry.reject(new TranscriberUnavailableError(message));
      pending.delete(id);
    }
  }

  function onMessage(message: Reply): void {
    if ("ready" in message) {
      if (message.ready) {
        ready = true;
      } else {
        failAll(message.error);
      }
      return;
    }
    const entry = pending.get(message.id);
    if (!entry) {
      return;
    }
    clearTimeout(entry.timer);
    pending.delete(message.id);
    if (message.error) {
      entry.reject(new Error(message.error));
    } else {
      entry.resolve(message.text ?? "");
    }
  }

  function start(): Promise<void> {
    if (ready && child && !child.killed) {
      return Promise.resolve();
    }
    if (startPromise) {
      return startPromise;
    }

    startPromise = new Promise<void>((resolve, reject) => {
      const env = {
        ...process.env,
        MEMENTO_MODELS_DIR: process.env.MEMENTO_MODELS_DIR ?? "./data/models",
        TRANSCRIBE_THREADS: process.env.TRANSCRIBE_THREADS ?? "4",
      };
      const proc = fork(fileURLToPath(workerUrl), [], {
        env,
        execArgv: isDev ? ["--import", "tsx/esm"] : [],
        stdio: ["ignore", "inherit", "inherit", "ipc"],
      });
      child = proc;
      ready = false;

      const onReady = (message: Reply): void => {
        if ("ready" in message) {
          proc.off("message", onReady);
          if (message.ready) {
            ready = true;
            resolve();
          } else {
            startPromise = null;
            reject(new TranscriberUnavailableError(message.error));
          }
        }
      };
      proc.on("message", onReady);
      proc.on("message", onMessage);
      proc.on("exit", () => {
        proc.off("message", onReady);
        ready = false;
        if (child === proc) {
          child = null;
        }
        failAll("Transcriber worker exited");
      });
      proc.on("error", (err) => {
        startPromise = null;
        reject(new TranscriberUnavailableError(err.message));
      });
    }).finally(() => {
      startPromise = null;
    });

    return startPromise;
  }

  return {
    start,
    stop(): void {
      if (child && !child.killed) {
        child.kill();
      }
      child = null;
      ready = false;
      failAll("Transcriber stopped");
    },
    async transcribe(wavPath: string): Promise<string> {
      if (ready && child && !child.killed) {
        // fast path
      } else {
        await start();
      }
      if (!child || !ready) {
        throw new TranscriberUnavailableError();
      }

      const id = randomUUID();
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error("Transcription timed out"));
        }, REQUEST_TIMEOUT_MS);
        pending.set(id, { resolve, reject, timer });
        child!.send({ id, wavPath });
      });
    },
  };
}

export type Transcriber = ReturnType<typeof createTranscriber>;

export const transcriber = createTranscriber();
