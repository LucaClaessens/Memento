import type { Entry } from "@memento/shared";
import { SvelteMap, SvelteDate } from "svelte/reactivity";
import { entriesApi } from "$lib/api";
import { textEntry } from "$lib/capture";

export class EntriesStore {
  entries = $state<Entry[]>([]);
  loading = $state(false);
  submitting = $state(false);
  loadError = $state<string | null>(null);
  submitError = $state<string | null>(null);

  private pollTimers = new SvelteMap<string, ReturnType<typeof setInterval>>();

  async load(): Promise<void> {
    if (this.loading) return;

    this.loading = true;
    this.loadError = null;

    try {
      this.entries = await entriesApi.list();
      this.ensureListPolling();
    } catch {
      this.loadError =
        "Couldn’t load your entries. Check that the Memento API is running.";
    } finally {
      this.loading = false;
    }
  }

  async transcribe(id: string): Promise<void> {
    try {
      const updated = await entriesApi.transcribe(id);
      this.entries = this.entries.map((e) => (e.id === id ? updated : e));
      if (updated.transcriptionStatus === "pending") {
        this.startPolling(id);
        this.ensureListPolling();
      }
    } catch {
      this.submitError = "Couldn’t retry transcription.";
    }
  }

  async capture(rawText: string): Promise<boolean> {
    if (this.submitting) return false;
    this.submitting = true;
    this.submitError = null;

    try {
      const entry = await entriesApi.create(textEntry(rawText));

      this.entries = [
        entry,
        ...this.entries.filter((existing) => existing.id !== entry.id),
      ];
      return true;
    } catch {
      this.submitError =
        "Couldn’t save your entry. Your text is still here — try again.";
      return false;
    } finally {
      this.submitting = false;
    }
  }

  async captureVoice(blob: Blob): Promise<Entry | null> {
    if (this.submitting) return null;
    this.submitting = true;
    this.submitError = null;

    const id = crypto.randomUUID();
    const createdAt = new SvelteDate().toISOString();

    try {
      const entry = await entriesApi.createVoice(blob, { id, createdAt });

      this.entries = [
        entry,
        ...this.entries.filter((existing) => existing.id !== entry.id),
      ];
      this.startPolling(entry.id);
      this.ensureListPolling();
      return entry;
    } catch {
      this.submitError = "Couldn’t save your recording. Try again.";
      return null;
    } finally {
      this.submitting = false;
    }
  }

  startPolling(id: string): void {
    if (this.pollTimers.has(id)) return;
    const timer = setInterval(async () => {
      try {
        const updated = await entriesApi.get(id);
        this.entries = this.entries.map((e) => (e.id === id ? updated : e));
        if (
          updated.transcriptionStatus === "done" ||
          updated.transcriptionStatus === "failed"
        ) {
          this.stopPolling(id);
        }
      } catch {
        // ignore; keep polling
      }
    }, 2000);
    this.pollTimers.set(id, timer);
  }

  stopPolling(id: string): void {
    const timer = this.pollTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(id);
    }
  }

  ensureListPolling(): void {
    if (this.entries.some((e) => e.transcriptionStatus === "pending")) {
      if (!this.pollTimers.has("__list__")) {
        const timer = setInterval(async () => {
          try {
            const list = await entriesApi.list();
            this.entries = list;
            if (!list.some((e) => e.transcriptionStatus === "pending")) {
              this.stopPolling("__list__");
            }
          } catch {
            // ignore
          }
        }, 2000);
        this.pollTimers.set("__list__", timer);
      }
    }
  }
}

export const entries = new EntriesStore();
