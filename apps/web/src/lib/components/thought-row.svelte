<script lang="ts">
  import { onMount, tick } from "svelte";
  import { resolve } from "$app/paths";
  import type { Entry } from "@memento/shared";
  import {
    formatThoughtDate,
    thoughtSummary,
    thoughtTitle,
  } from "$lib/thoughts";
  import ThoughtDetailContent from "$lib/components/thought-detail-content.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";

  interface Props {
    entry: Entry;
    now?: Date;
    active?: boolean;
    pushed?: "up" | "down" | null;
    onclosed?: () => void;
  }

  let { entry, now, active = false, pushed = null, onclosed }: Props = $props();

  const HEADER = 56;
  const title = $derived(thoughtTitle(entry));
  const summary = $derived(thoughtSummary(entry));
  const dateLabel = $derived(formatThoughtDate(entry.createdAt, now));

  let el: HTMLAnchorElement | null = $state(null);
  let rect = $state<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  let card = $state(false);
  let grown = $state(false);
  let showDetail = $state(false);
  let closing = $state(false);
  let viewport = $state({ width: 0, height: 0 });

  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  onMount(() => {
    const update = () => {
      viewport = { width: window.innerWidth, height: window.innerHeight };
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  $effect(() => {
    if (active && !card && !closing && el) {
      const r = el.getBoundingClientRect();
      rect = { top: r.top, left: r.left, width: r.width, height: r.height };
      card = true;
      void tick().then(() => {
        requestAnimationFrame(() => {
          grown = true;
          setTimeout(() => (showDetail = true), reduced() ? 0 : 240);
        });
      });
    }
  });

  $effect(() => {
    if (active) {
      thoughtOverlay.closeHandler = () => void close();
      return () => {
        if (thoughtOverlay.closeHandler) thoughtOverlay.closeHandler = null;
      };
    }
  });

  async function close(): Promise<void> {
    if (closing) return;
    closing = true;
    thoughtOverlay.closing = true;
    showDetail = false;
    if (!reduced()) await wait(180);
    grown = false;
    if (!reduced()) await wait(380);
    card = false;
    closing = false;
    onclosed?.();
  }

  const cardStyle = $derived(
    card && rect
      ? `position: fixed; z-index: 50; top: ${
          grown ? HEADER : rect.top
        }px; left: ${grown ? 0 : rect.left}px; width: ${
          grown ? viewport.width : rect.width
        }px; height: ${grown ? viewport.height - HEADER : rect.height}px;`
      : ""
  );
</script>

{#if card && rect}
  <div
    class="placeholder"
    style:height={`${rect.height}px`}
    aria-hidden="true"
  ></div>
{/if}

<a
  bind:this={el}
  href={card ? undefined : resolve(`/thoughts/${entry.id}`)}
  data-thought-id={entry.id}
  class="-mx-4 block px-4 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:-mx-3 md:px-3"
  class:card
  class:pushed-up={pushed === "up"}
  class:pushed-down={pushed === "down"}
  class:show-detail={showDetail}
  role={card ? "dialog" : undefined}
  aria-modal={card ? "true" : undefined}
  aria-label={card ? title : undefined}
  style={cardStyle}
>
  <div class="row-head">
    <time
      class="block text-[0.69rem] leading-none text-muted-foreground"
      datetime={entry.createdAt}
    >
      {dateLabel}
    </time>
    <h1 class="row-title">{title}</h1>
  </div>
  {#if summary && !card}
    <span
      class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
    >
      {summary}
    </span>
  {/if}
  {#if card}
    <div class="detail">
      <ThoughtDetailContent visible={showDetail} />
    </div>
  {/if}
</a>

<style>
  .placeholder {
    width: 100%;
  }

  a.card {
    overflow-y: auto;
    margin: 0;
    background: var(--background);
    border: 0;
    padding: 20px 16px;
    transition:
      top var(--m-dur-expand) var(--ease-out),
      left var(--m-dur-expand) var(--ease-out),
      width var(--m-dur-expand) var(--ease-out),
      height var(--m-dur-expand) var(--ease-out);
  }
  a.card:hover {
    background: var(--background);
  }

  .row-title {
    margin-top: 6px;
    font-weight: 600;
    letter-spacing: -0.011em;
    line-height: 1.34;
    font-size: 1.06rem;
    width: fit-content;
    transition:
      font-size var(--m-dur-expand) var(--ease-out),
      letter-spacing var(--m-dur-expand) var(--ease-out);
  }
  a.card .row-title {
    font-size: 2.25rem;
    line-height: 1.1;
    letter-spacing: -0.028em;
  }

  .detail {
    pointer-events: none;
  }
  a.card.show-detail .detail {
    pointer-events: auto;
  }

  a.pushed-up {
    transform: translateY(-100vh);
    pointer-events: none;
  }
  a.pushed-down {
    transform: translateY(100vh);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    a.card,
    .row-title,
    .detail {
      transition: none;
    }
  }
</style>
