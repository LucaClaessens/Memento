import { describe, expect, it } from "vitest";
import {
  THOUGHT_HEADER_HEIGHT,
  cardTarget,
  pushDirection,
  pushDistances,
} from "./thoughts-transition";

const VIEWPORT = { width: 390, height: 844 };

describe("cardTarget", () => {
  it("fills the viewport below the 56px top bar", () => {
    expect(cardTarget(VIEWPORT)).toEqual({
      top: 56,
      left: 0,
      width: 390,
      height: 788,
    });
  });
});

describe("pushDistances", () => {
  it("moves rows above by the card's top travel", () => {
    expect(pushDistances({ top: 500, height: 120 }, 844).up).toBe(444);
  });

  it("moves rows below by the card's bottom travel", () => {
    expect(pushDistances({ top: 500, height: 120 }, 844).down).toBe(224);
  });

  it("keeps the row above flush with the top bar after the push", () => {
    const rect = { top: 500, height: 120 };
    const { up } = pushDistances(rect, 844);
    // The last row above ends exactly at the bar's bottom edge.
    expect(rect.top - up).toBe(THOUGHT_HEADER_HEIGHT);
  });

  it("keeps the row below flush with the viewport bottom after the push", () => {
    const rect = { top: 500, height: 120 };
    const { down } = pushDistances(rect, 844);
    expect(rect.top + rect.height + down).toBe(844);
  });

  it("never pushes past the edge when the row already sits at the bar", () => {
    expect(
      pushDistances({ top: THOUGHT_HEADER_HEIGHT, height: 100 }, 844)
    ).toEqual({ up: 0, down: 688 });
  });

  it("never pushes past the edge when the row already ends at the viewport", () => {
    expect(pushDistances({ top: 500, height: 344 }, 844)).toEqual({
      up: 444,
      down: 0,
    });
  });
});

describe("pushDirection", () => {
  it("returns null when nothing is open", () => {
    expect(pushDirection(0, -1)).toBeNull();
  });

  it("returns null for the active row", () => {
    expect(pushDirection(3, 3)).toBeNull();
  });

  it("moves rows before the active row up and after it down", () => {
    expect(pushDirection(0, 3)).toBe("up");
    expect(pushDirection(2, 3)).toBe("up");
    expect(pushDirection(4, 3)).toBe("down");
  });
});
