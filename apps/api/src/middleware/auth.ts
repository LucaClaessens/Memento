// Auth middleware slot. v1: Tailscale is the network boundary + a single shared token.
// Replace the body of this middleware with a real auth solution later (ADR-0005);
// route handlers must not depend on auth details.
import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = process.env.MEMENTO_API_TOKEN;
  if (token) {
    const provided = c.req.header("x-memento-token");
    if (provided !== token) {
      return c.json({ error: "unauthorized" }, 401);
    }
  }
  await next();
};
