import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { openDatabase } from "./db/index.js";

const db = openDatabase();
const app = createApp({ db });

// Auth middleware slot: replace this with a real auth solution later (ADR-0005).
// app.use("/api/*", authMiddleware);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Memento API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    db.close();
    process.exit(0);
  });
}

export default app;
