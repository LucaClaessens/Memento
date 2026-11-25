import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Db } from "./db/types.js";
import { entries } from "./routes/entries.js";
import { health } from "./routes/health.js";

export const DEFAULT_WEB_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function parseOrigins(value: string | undefined): string[] {
  const origins = (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : DEFAULT_WEB_ORIGINS;
}

export interface AppOptions {
  db: Db;
  allowedOrigins?: string[];
}

export function createApp({ db, allowedOrigins }: AppOptions): Hono {
  const origins =
    allowedOrigins ?? parseOrigins(process.env.MEMENTO_WEB_ORIGIN);
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: origins,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      maxAge: 600,
    })
  );

  app.route("/health", health);
  app.route("/entries", entries(db));
  app.get("/", (c) => c.text("Memento API"));

  return app;
}
