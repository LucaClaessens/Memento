<script lang="ts">
  import { onMount } from "svelte";
  import ThoughtList from "$lib/components/thought-list.svelte";
  import { entries } from "$lib/stores/entries.svelte";

  let scrolled = $state(false);
  let scrollContainer: HTMLElement | null = $state(null);

  onMount(() => {
    void entries.load();
    scrollContainer = document.querySelector<HTMLElement>(
      "[data-scroll-container]"
    );
    const onScroll = () => {
      scrolled = (scrollContainer?.scrollTop ?? 0) > 40;
    };
    scrollContainer?.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollContainer?.removeEventListener("scroll", onScroll);
  });
</script>

<svelte:head>
  <title>Thoughts — Memento</title>
</svelte:head>

<div class="flex h-full min-h-0 flex-col bg-background text-foreground">
  <div class="title-wrap" class:scrolled>
    <div class="title-gradient" aria-hidden="true"></div>
    <h1 class="page-title" class:large={!scrolled} class:small={scrolled}>
      Thoughts
    </h1>
  </div>
  <main
    data-scroll-container
    class="mx-auto w-full max-w-[720px] min-h-0 flex-1 overflow-y-auto px-4 pb-8 md:px-0"
  >
    <ThoughtList
      entries={entries.entries}
      loading={entries.loading}
      error={entries.loadError}
      onRetry={() => void entries.load()}
    />
  </main>
</div>

<style>
  .title-wrap {
    position: sticky;
    top: 0;
    z-index: 5;
    padding: 1.5rem 1rem 0.5rem;
  }
  .title-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, var(--background) 55%, transparent);
    pointer-events: none;
  }
  .page-title {
    position: relative;
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.1;
    transition: font-size 250ms cubic-bezier(0.22, 1, 0.36, 1);
    width: fit-content;
  }
  .page-title.large {
    font-size: 2.25rem;
  }
  .page-title.small {
    font-size: 1.125rem;
  }
  @media (prefers-reduced-motion: reduce) {
    .page-title {
      transition: none;
    }
  }
</style>
