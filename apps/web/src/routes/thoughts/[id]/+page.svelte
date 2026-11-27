<script lang="ts">
  import { onDestroy } from "svelte";
  import { page } from "$app/state";
  import { thoughtDetail } from "$lib/stores/thought-detail.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";
  import { splitThought } from "$lib/thoughts";

  const id = $derived(page.params.id ?? "");
  const title = $derived(
    thoughtDetail.thought
      ? splitThought(thoughtDetail.thought).title
      : "Thought"
  );

  $effect(() => {
    const currentId = id;
    if (!currentId) return;
    thoughtOverlay.open(currentId);
    if (thoughtDetail.thought?.id !== currentId) {
      void thoughtDetail.load(currentId);
    }
  });

  onDestroy(() => {
    thoughtOverlay.close();
  });
</script>

<svelte:head>
  <title>{title} — Memento</title>
</svelte:head>
