import type { Entry } from "@memento/shared";
import { entriesApi } from "$lib/api";
import { ApiError } from "$lib/api/client";
import { textEntry } from "$lib/capture";

function chronological(a: Entry, b: Entry): number {
  return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

export class ThoughtDetailStore {
  thought = $state<Entry | null>(null);
  followUps = $state<Array<Entry>>([]);
  loading = $state(false);
  loadError = $state<string | null>(null);
  notFound = $state(false);
  submitting = $state(false);
  submitError = $state<string | null>(null);

  #request = 0;
  #loadedId: string | null = null;

  async load(id: string): Promise<void> {
    if (this.#loadedId === id && !this.loadError) {
      return;
    }

    const request = ++this.#request;
    this.loading = true;
    this.loadError = null;
    this.notFound = false;
    this.thought = null;
    this.followUps = [];

    try {
      const [thought, children] = await Promise.all([
        entriesApi.get(id),
        entriesApi.list(50, id),
      ]);
      if (request !== this.#request) {
        return;
      }

      this.thought = thought;
      this.followUps = [...children].sort(chronological);
      this.#loadedId = id;
    } catch (error) {
      if (request !== this.#request) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        this.notFound = true;
      } else {
        this.loadError =
          "Couldn’t load this thought. Check that the Memento API is running.";
      }
    } finally {
      if (request === this.#request) {
        this.loading = false;
      }
    }
  }

  async addFollowUp(parentId: string, rawText: string): Promise<boolean> {
    if (this.submitting) {
      return false;
    }

    this.submitting = true;
    this.submitError = null;

    try {
      const entry = await entriesApi.create({
        ...textEntry(rawText),
        parentId,
      });

      this.followUps = [
        ...this.followUps.filter((existing) => existing.id !== entry.id),
        entry,
      ].sort(chronological);
      return true;
    } catch {
      this.submitError =
        "Couldn’t add your follow-up. Your text is still here — try again.";
      return false;
    } finally {
      this.submitting = false;
    }
  }
}

export const thoughtDetail = new ThoughtDetailStore();
