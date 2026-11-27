import { firstLineTitle, type Entry } from "@memento/shared";

export interface ThoughtDisplay {
  title: string;
  body: string;
}

/** The stored title, falling back to the first line for legacy rows. */
export function thoughtTitle(entry: Pick<Entry, "title" | "rawText">): string {
  return entry.title?.trim() || firstLineTitle(entry.rawText);
}

/**
 * The summary shown in the list: the stored summary when #39 supplies one,
 * otherwise the lines after the first line, collapsed to a single preview.
 */
export function thoughtSummary(
  entry: Pick<Entry, "summary" | "title" | "rawText">
): string | null {
  const stored = entry.summary?.trim();
  if (stored) {
    return stored;
  }

  const lines = entry.rawText.split(/\r?\n/);
  const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstLineIndex === -1) {
    return null;
  }

  const preview = lines
    .slice(firstLineIndex + 1)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return preview || null;
}

/**
 * The detail view's title and body. When the title is the first-line fallback,
 * the first line is the heading and the body starts after it, so the line is
 * not shown twice. The stored rawText is never changed.
 */
export function splitThought(
  entry: Pick<Entry, "title" | "titleSource" | "rawText">
): ThoughtDisplay {
  const fallback = firstLineTitle(entry.rawText);
  const title = entry.title?.trim() || fallback;
  const isFirstLineFallback = entry.titleSource !== "ai" && title === fallback;

  if (!isFirstLineFallback) {
    return { title, body: entry.rawText };
  }

  const lines = entry.rawText.split(/\r?\n/);
  const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstLineIndex === -1) {
    return { title, body: "" };
  }

  return {
    title,
    body: lines
      .slice(firstLineIndex + 1)
      .join("\n")
      .replace(/^\n+/, "")
      .trimEnd(),
  };
}

interface DateFormatters {
  time: Intl.DateTimeFormat;
  shortDate: Intl.DateTimeFormat;
  fullDate: Intl.DateTimeFormat;
}

const formatterCache = new Map<string, DateFormatters>();

function formatters(locale?: string): DateFormatters {
  const key = locale ?? "default";
  const cached = formatterCache.get(key);
  if (cached) {
    return cached;
  }

  const created: DateFormatters = {
    time: new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }),
    shortDate: new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }),
    fullDate: new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
  formatterCache.set(key, created);
  return created;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

/** "Today · 8:12 AM", "Yesterday · 9:40 PM", "Nov 24", or "Nov 24, 2025". */
export function formatThoughtDate(
  createdAt: string | Date,
  now: Date = new Date(),
  locale?: string
): string {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const format = formatters(locale);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (days === 0) {
    return `Today · ${format.time.format(date)}`;
  }
  if (days === 1) {
    return `Yesterday · ${format.time.format(date)}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return format.shortDate.format(date);
  }

  return format.fullDate.format(date);
}
