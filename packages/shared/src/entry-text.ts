export const MAX_TITLE_LENGTH = 80;
export const UNTITLED_THOUGHT = "Untitled thought";

/**
 * The deterministic title fallback: the first non-empty line, trimmed, capped at
 * 80 characters. The stored title is a projection; `rawText` stays the source.
 */
export function firstLineTitle(rawText: string): string {
  const firstLine = rawText
    .split(/\r?\n/)
    .find((line) => line.trim().length > 0)
    ?.trim();

  if (!firstLine) {
    return UNTITLED_THOUGHT;
  }
  if (firstLine.length <= MAX_TITLE_LENGTH) {
    return firstLine;
  }

  return `${firstLine.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
}
