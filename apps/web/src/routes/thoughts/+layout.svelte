<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ThoughtsHeader from "$lib/components/thoughts-header.svelte";
  import ThoughtList from "$lib/components/thought-list.svelte";
  import ThoughtDetailContent from "$lib/components/thought-detail-content.svelte";
  import { entries } from "$lib/stores/entries.svelte";
  import { thoughtDetail } from "$lib/stores/thought-detail.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";

  let { children }: { children: Snippet } = $props();

  let scrolled = $state(false);
  let scrollEl: HTMLElement | null = $state(null);

  const isOpen = $derived(thoughtOverlay.activeId !== null);
  // The bar returns to its list state as soon as the close starts, so the
  // arrow/title reverse on the same beat as the open.
  const headerOpen = $derived(isOpen && !thoughtOverlay.closing);
  const activeEntry = $derived(
    entries.entries.find((entry) => entry.id === thoughtOverlay.activeId) ??
      null
  );
  // A detail opened by URL may not be in the loaded list (invalid id or older
  // than the list limit). Render the card without the grow instead of a blank.
  const fallback = $derived(isOpen && activeEntry === null);

  onMount(() => {
    void entries.load();
    const el = scrollEl;
    const onScroll = () => {
      scrolled = (el?.scrollTop ?? 0) > 40;
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  });

  // When the card finishes closing, leave the detail route.
  $effect(() => {
    if (
      thoughtOverlay.activeId === null &&
      page.url.pathname.startsWith("/thoughts/")
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

  {#if fallback}
    <div
      class="fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto bg-background px-4 pb-8"
      role="dialog"
      aria-label={thoughtDetail.thought?.title ?? "Thought"}
    >
      <div class="mx-auto w-full max-w-[720px] pt-5 md:px-0">
        <ThoughtDetailContent visible id={thoughtOverlay.activeId ?? ""} />
      </div>
    </div>
  {/if}
</div>
