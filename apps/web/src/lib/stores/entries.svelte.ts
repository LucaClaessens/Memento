import type { Entry } from "@memento/shared";
import type { EntriesApi } from "$lib/api";
import { textEntry } from "$lib/capture";

export class EntriesStore {
  #api: EntriesApi;
  entries = $state<Array<Entry>>([]);
  loading = $state(false);
  submitting = $state(false);
  loadError = $state<string | null>(null);
  submitError = $state<string | null>(null);

  constructor(api: EntriesApi) {
    this.#api = api;
  }

  async load(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.loadError = null;

    try {
      this.entries = await this.#api.list();
    } catch {
      this.loadError =
        "Couldn’t load your entries. Check that the Memento API is running.";
    } finally {
      this.loading = false;
    }
  }

  async capture(rawText: string): Promise<boolean> {
    if (this.submitting) {
      return false;
    }
    this.submitting = true;
    this.submitError = null;

    try {
      const entry = await this.#api.create(textEntry(rawText));

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
}

export function createEntriesStore(api: EntriesApi): EntriesStore {
  return new EntriesStore(api);
}
