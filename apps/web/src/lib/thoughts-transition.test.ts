import { describe, expect, it } from "vitest";
import {
  THOUGHT_HEADER_HEIGHT,
  cardTarget,
  pushDirection,
  pushDistances,
} from "./thoughts-transition";

describe("cardTarget", () => {
  it("fills the viewport below the top bar", () => {
    expect(cardTarget({ width: 390, height: 844 })).toEqual({
      top: THOUGHT_HEADER_HEIGHT,
      left: 0,
      width: 390,
      height: 844 - THOUGHT_HEADER_HEIGHT,
    });
  });
});

describe("pushDistances", () => {
  it("moves rows above by the card's top travel", () => {
    // The row starts 500px down; the card top ends at the header.
    expect(pushDistances({ top: 500, height: 120 }, 844).up).toBe(
      500 - THOUGHT_HEADER_HEIGHT
    );
  });

  it("moves rows below by the card's bottom travel", () => {
    // The row ends 260px above the viewport bottom.
    expect(pushDistances({ top: 500, height: 120 }, 844).down).toBe(844 - 620);
  });

  it("never pushes a row past its edge when the row is already at the bar", () => {
    expect(
      pushDistances({ top: THOUGHT_HEADER_HEIGHT, height: 100 }, 844)
    ).toEqual({ up: 0, down: 844 - 156 });
  });

  it("never pushes a row past its edge when the row already ends at the viewport", () => {
    expect(pushDistances({ top: 500, height: 344 }, 844)).toEqual({
      up: 500 - THOUGHT_HEADER_HEIGHT,
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
