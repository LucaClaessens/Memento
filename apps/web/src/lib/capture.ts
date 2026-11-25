import type { CreateEntry } from "@memento/shared";

/**
 * A client-generated id and timestamp make capture idempotent today and
 * ready for offline queuing later (ADR-0004).
 */
export function textEntry(rawText: string): CreateEntry {
  return {
    id: crypto.randomUUID(),
    rawText,
    source: "text",
    createdAt: new Date().toISOString(),
  };
}
