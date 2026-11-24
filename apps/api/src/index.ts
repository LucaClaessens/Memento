import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { health } from "./routes/health.js";

const app = new Hono();

app.route("/health", health);

// Auth middleware slot: replace this with a real auth solution later (ADR-0005).
// app.use("/api/*", authMiddleware);

app.get("/", (c) => c.text("Memento API"));

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Memento API listening on http://localhost:${info.port}`);
});

export default app;
