import { describe, expect, it } from "vitest";
import {
  BRAND,
  greetingBands,
  greetingFor,
  isKeyboardOpen,
  isTabActive,
  longDateFormatter,
  tabs,
} from "./navigation";

describe("tabs", () => {
  it("exposes exactly the two settled destinations", () => {
    expect(tabs.map((tab) => [tab.href, tab.label])).toEqual([
      ["/", "Write"],
      ["/thoughts", "Thoughts"],
    ]);
    expect(BRAND).toBe("Memento");
  });

  it("matches the root only on the root route", () => {
    expect(isTabActive("/", "/")).toBe(true);
    expect(isTabActive("/thoughts", "/")).toBe(false);
  });

  it("matches a tab route and its nested routes", () => {
    expect(isTabActive("/thoughts", "/thoughts")).toBe(true);
    expect(
      isTabActive("/thoughts/11111111-1111-4111-8111-111111111111", "/thoughts")
    ).toBe(true);
    expect(isTabActive("/thoughts-old", "/thoughts")).toBe(false);
  });
});

describe("greetingFor", () => {
  it("uses the morning greeting before noon", () => {
    expect(greetingFor(new Date(2026, 10, 27, 8, 12))).toBe("good morning.");
  });

  it("uses the afternoon greeting until 18:00", () => {
    expect(greetingFor(new Date(2026, 10, 27, 14, 0))).toBe("good afternoon.");
    expect(greetingFor(new Date(2026, 10, 27, 17, 59))).toBe("good afternoon.");
  });

  it("uses the evening greeting from 18:00 onward", () => {
    expect(greetingFor(new Date(2026, 10, 27, 18, 0))).toBe("good evening.");
    expect(greetingFor(new Date(2026, 10, 27, 23, 59))).toBe("good evening.");
  });

  it("has three editable bands covering the whole day", () => {
    expect(greetingBands).toHaveLength(3);
    expect(greetingBands[2].untilHour).toBe(24);
  });
});

describe("isKeyboardOpen", () => {
  it("is false when the viewport is unchanged", () => {
    expect(isKeyboardOpen(800, 800)).toBe(false);
  });

  it("is false for a small browser-chrome shift", () => {
    expect(isKeyboardOpen(800, 740)).toBe(false);
  });

  it("is true when the keyboard takes a large share of the viewport", () => {
    expect(isKeyboardOpen(800, 420)).toBe(true);
  });
});

describe("longDateFormatter", () => {
  it("formats the date line agreed in the design", () => {
    expect(longDateFormatter.format(new Date(2026, 10, 27, 12, 0))).toBe(
      "Friday, November 27"
    );
  });
});
