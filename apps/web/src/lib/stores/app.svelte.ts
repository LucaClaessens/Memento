// Composition root for the app-wide stores: the one place the real API client
// is wired in. Tests construct stores with `create*Store(fakeApi)` instead.
import { entriesApi } from "$lib/api";
import { createEntriesStore } from "./entries.svelte";
import { createNavigationStore } from "./navigation.svelte";
import { createThoughtDetailStore } from "./thought-detail.svelte";
import { createThoughtOverlayStore } from "./thought-overlay.svelte";

export const entries = createEntriesStore(entriesApi);
export const thoughtDetail = createThoughtDetailStore(entriesApi);
export const thoughtOverlay = createThoughtOverlayStore();
export const navigation = createNavigationStore();
