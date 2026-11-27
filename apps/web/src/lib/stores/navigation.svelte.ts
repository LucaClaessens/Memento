import { isKeyboardOpen } from "$lib/navigation";

/**
 * Tracks whether the on-screen keyboard is covering the bottom of the viewport.
 * The shell attaches this once at the root; the bottom bar reads the state.
 */
export class NavigationStore {
  keyboardOpen = $state(false);

  attach(): () => void {
    const viewport = window.visualViewport;
    if (!viewport) return () => {};

    const update = (): void => {
      this.keyboardOpen = isKeyboardOpen(window.innerHeight, viewport.height);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }
}

export const navigation = new NavigationStore();
