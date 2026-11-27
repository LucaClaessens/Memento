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

  /** The distance the rows above and below must travel with the card. */
  setPush(up: number, down: number): void {
    this.pushUp = up;
    this.pushDown = down;
  }

  close(): void {
    this.activeId = null;
  }

  requestClose(): void {
    if (this.closeHandler) this.closeHandler();
    else this.finishClose();
  }

  finishClose(): void {
    this.closeHandler = null;
    this.activeId = null;
    this.closing = false;
  }
}

export const thoughtOverlay = new ThoughtOverlayStore();
