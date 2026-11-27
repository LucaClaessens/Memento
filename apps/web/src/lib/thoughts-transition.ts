/**
 * Geometry for the thoughts list ↔ detail transition.
 *
 * The tapped row becomes a fixed card that grows to fill the space below the
 * fixed top bar, while the rows above and below move out of the way. Keeping
 * these calculations pure lets tests pin the invariant that matters: the
 * siblings travel exactly as far as the card's edges, so no gap opens.
 */

export const THOUGHT_HEADER_HEIGHT = 56;

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CardTarget {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Where the expanded card ends up: below the top bar, full viewport otherwise. */
export function cardTarget(viewport: {
  width: number;
  height: number;
}): CardTarget {
  return {
    top: THOUGHT_HEADER_HEIGHT,
    left: 0,
    width: viewport.width,
    height: viewport.height - THOUGHT_HEADER_HEIGHT,
  };
}

export interface PushDistances {
  up: number;
  down: number;
}

/**
 * How far the rows above and below must travel so their edge meets the card's
 * new edge. `up` equals the card's top travel, `down` its bottom travel.
 */
export function pushDistances(
  rect: Pick<Rect, "top" | "height">,
  viewportHeight: number
): PushDistances {
  return {
    up: Math.max(0, rect.top - THOUGHT_HEADER_HEIGHT),
    down: Math.max(0, viewportHeight - (rect.top + rect.height)),
  };
}

export type PushDirection = "up" | "down" | null;

/** Which way a row moves, given the active row's index. */
export function pushDirection(
  index: number,
  activeIndex: number
): PushDirection {
  if (activeIndex === -1 || index === activeIndex) {
    return null;
  }
  return index < activeIndex ? "up" : "down";
}
