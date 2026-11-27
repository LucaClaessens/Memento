import { describe, expect, it } from "vitest";
import {
  formatThoughtDate,
  splitThought,
  thoughtSummary,
  thoughtTitle,
} from "./thoughts";

describe("thoughtTitle", () => {
  it("uses the stored title", () => {
    expect(
      thoughtTitle({ title: "Morning walk", rawText: "ignored\nbody" })
    ).toBe("Morning walk");
  });

  it("falls back to the first line when the title is missing", () => {
    expect(
      thoughtTitle({ title: null, rawText: "\n  Morning walk  \nbody" })
    ).toBe("Morning walk");
  });

  it("falls back to Untitled thought for empty text", () => {
    expect(thoughtTitle({ title: null, rawText: " \n\t " })).toBe(
      "Untitled thought"
    );
  });
});

describe("thoughtSummary", () => {
  it("prefers a stored summary", () => {
    expect(
      thoughtSummary({
        summary: "  A stored summary.  ",
        title: "Title",
        rawText: "Title\nA derived summary.",
      })
    ).toBe("A stored summary.");
  });

  it("derives a preview from the lines after the first", () => {
    expect(
      thoughtSummary({
        summary: null,
        title: "Morning walk",
        rawText:
          "Morning walk\nA short walk cleared my head.\nThe light was good.",
      })
    ).toBe("A short walk cleared my head. The light was good.");
  });

  it("collapses whitespace and skips blank leading lines", () => {
    expect(
      thoughtSummary({
        summary: null,
        title: "Title",
        rawText: "\n  Title  \n\n  first   line \n\n second line  ",
      })
    ).toBe("first line second line");
  });

  it("returns null when there is only a title line", () => {
    expect(
      thoughtSummary({
        summary: null,
        title: "Just one line",
        rawText: "Just one line",
      })
    ).toBeNull();
  });
});

describe("splitThought", () => {
  it("turns the first line into the heading and starts the body after it", () => {
    expect(
      splitThought({
        title: "Morning walk",
        titleSource: "first_line",
        rawText: "\n  Morning walk  \nsecond line\n\nthird",
      })
    ).toEqual({
      title: "Morning walk",
      body: "second line\n\nthird",
    });
  });

  it("keeps the full raw text when an AI title differs", () => {
    expect(
      splitThought({
        title: "A better title",
        titleSource: "ai",
        rawText: "Original first line\nbody",
      })
    ).toEqual({
      title: "A better title",
      body: "Original first line\nbody",
    });
  });

  it("returns an empty body for a one-line entry", () => {
    expect(
      splitThought({
        title: "Just one line",
        titleSource: "first_line",
        rawText: "Just one line",
      })
    ).toEqual({ title: "Just one line", body: "" });
  });

  it("keeps the full raw text when the stored title is not the first line", () => {
    expect(
      splitThought({
        title: "A manually different title",
        titleSource: "first_line",
        rawText: "Original first line\nbody",
      })
    ).toEqual({
      title: "A manually different title",
      body: "Original first line\nbody",
    });
  });
});

describe("formatThoughtDate", () => {
  const now = new Date(2026, 10, 27, 18, 0);

  it("labels today with the time", () => {
    expect(formatThoughtDate(new Date(2026, 10, 27, 8, 12), now, "en-US")).toBe(
      "Today · 8:12 AM"
    );
  });

  it("labels yesterday with the time", () => {
    expect(
      formatThoughtDate(new Date(2026, 10, 26, 21, 40), now, "en-US")
    ).toBe("Yesterday · 9:40 PM");
  });

  it("uses a short date earlier in the same year", () => {
    expect(formatThoughtDate(new Date(2026, 10, 24, 12, 0), now, "en-US")).toBe(
      "Nov 24"
    );
  });

  it("includes the year for an earlier year", () => {
    expect(formatThoughtDate(new Date(2025, 11, 31, 12, 0), now, "en-US")).toBe(
      "Dec 31, 2025"
    );
  });
});
