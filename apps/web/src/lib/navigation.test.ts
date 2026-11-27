import { describe, expect, it } from "vitest";
import { isKeyboardOpen, isTabActive, tabs } from "./navigation";

describe("tabs", () => {
  it("exposes exactly the two settled destinations", () => {
    expect(tabs.map((tab) => [tab.href, tab.label])).toEqual([
      ["/", "Write"],
      ["/thoughts", "Thoughts"],
    ]);
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
