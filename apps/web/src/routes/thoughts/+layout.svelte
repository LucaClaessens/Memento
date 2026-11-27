<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";
  import ThoughtsHeader from "$lib/components/thoughts-header.svelte";
  import ThoughtList from "$lib/components/thought-list.svelte";
  import { entries } from "$lib/stores/entries.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";

  let { children }: { children: Snippet } = $props();

  let scrolled = $state(false);
  let scrollEl: HTMLElement | null = $state(null);

  const isOpen = $derived(thoughtOverlay.activeId !== null);
  // The bar returns to its list state as soon as the close starts, so the
  // arrow/title reverse on the same beat as the open.
  const headerOpen = $derived(isOpen && !thoughtOverlay.closing);

  onMount(() => {
    void entries.load();
    const el = document.querySelector<HTMLElement>("[data-scroll-container]");
    scrollEl = el;
    const onScroll = () => {
      scrolled = (scrollEl?.scrollTop ?? 0) > 40;
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  });

  // When the card finishes closing, leave the detail route.
  $effect(() => {
    if (
      thoughtOverlay.activeId === null &&
      location.pathname.startsWith("/thoughts/")
    ) {
      void goto(resolve("/thoughts"), { noScroll: true });
    }
  });
</script>

<div class="flex h-full min-h-0 flex-col bg-background text-foreground">
  <main
    data-scroll-container
    bind:this={scrollEl}
    class="mx-auto w-full max-w-[720px] min-h-0 flex-1 overflow-y-auto px-4 pb-8 [overflow-anchor:none] md:px-0"
  >
    <ThoughtsHeader
      small={scrolled || headerOpen}
      back={headerOpen}
      scrolled={scrolled || headerOpen}
      onback={headerOpen ? () => thoughtOverlay.requestClose() : undefined}
    />
    <ThoughtList
      entries={entries.entries}
      loading={entries.loading}
      error={entries.loadError}
      onRetry={() => void entries.load()}
    />
    {@render children()}
  </main>
</div>
