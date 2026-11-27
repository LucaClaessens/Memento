/** Which thought is currently expanded over the list. */
export class ThoughtOverlayStore {
  activeId = $state<string | null>(null);
  closing = $state(false);
  pushUp = $state(0);
  pushDown = $state(0);
  closeHandler: (() => void) | null = $state(null);

  open(id: string): void {
    this.activeId = id;
  }

  close(): void {
    this.activeId = null;
  }

  requestClose(): void {
    this.closeHandler?.();
  }

  finishClose(): void {
    this.closeHandler = null;
    this.activeId = null;
    this.closing = false;
  }
}

export const thoughtOverlay = new ThoughtOverlayStore();
