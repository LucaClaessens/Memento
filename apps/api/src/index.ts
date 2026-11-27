import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { openDatabase } from "./db/index.js";
import { transcriber } from "./ai/transcriber.js";
import { errorMessage } from "./errors.js";

const db = openDatabase();
const app = createApp({ db });

// Auth middleware slot: replace this with a real auth solution later (ADR-0005).
// app.use("/api/*", authMiddleware);

// Preload the transcription model so the first request is not penalised.
void transcriber.start().catch((error: unknown) => {
  console.error(`Transcriber unavailable: ${errorMessage(error)}`);
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Memento API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    transcriber.stop();
    db.close();
    process.exit(0);
  });
}

export default app;
