<script lang="ts">
  import { onMount } from "svelte";
  import AppBar from "$lib/components/app-bar.svelte";
  import ThoughtList from "$lib/components/thought-list.svelte";
  import { entries } from "$lib/stores/entries.svelte";

  onMount(() => {
    void entries.load();
  });
</script>

<svelte:head>
  <title>Thoughts — Memento</title>
</svelte:head>

<div class="flex min-h-dvh flex-col bg-background text-foreground">
  <AppBar right={{ href: "/", label: "Write" }} />

  <main
    class="mx-auto w-full max-w-[720px] flex-1 px-4 pt-6 pb-16 md:px-0 md:pt-10"
  >
    <h1 class="mb-6 text-3xl font-semibold tracking-[-0.025em] md:text-4xl">
      Thoughts
    </h1>

    <ThoughtList
      entries={entries.entries}
      loading={entries.loading}
      error={entries.loadError}
      onRetry={() => void entries.load()}
    />
  </main>
</div>
