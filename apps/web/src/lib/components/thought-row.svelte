<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { resolve } from "$app/paths";
  import type { Entry } from "@memento/shared";
  import {
    formatThoughtDate,
    thoughtSummary,
    thoughtTitle,
  } from "$lib/thoughts";
  import ThoughtDetailContent from "$lib/components/thought-detail-content.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";
  import { cardTarget, pushDistances } from "$lib/thoughts-transition";

  interface Props {
    entry: Entry;
    now?: Date;
    active?: boolean;
    first?: boolean;
    pushed?: "up" | "down" | null;
    onclosed?: () => void;
  }

  let {
    entry,
    now,
    active = false,
    first = false,
    pushed = null,
    onclosed,
  }: Props = $props();

  const title = $derived(thoughtTitle(entry));
  const summary = $derived(thoughtSummary(entry));
  const dateLabel = $derived(formatThoughtDate(entry.createdAt, now));

  let el: HTMLElement | null = $state(null);
  let rect = $state<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  let card = $state(false);
  let grown = $state(false);
  let titleLarge = $state(false);
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
      // Push siblings by the same distance the card's edges travel, so the
      // card and the list move as one surface.
      const push = pushDistances(r, window.innerHeight);
      thoughtOverlay.setPush(push.up, push.down);
      card = true;
      void tick().then(() => {
        requestAnimationFrame(() => {
          grown = true;
          titleLarge = true;
          // Fade the detail in across the grow rather than after it.
          setTimeout(() => (showDetail = true), reduced() ? 0 : 120);
          setTimeout(
            () => el?.focus({ preventScroll: true }),
            reduced() ? 0 : 120
          );
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

  // Keep Tab inside the card and its back control while the card is open.
  $effect(() => {
    if (!card) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !el) return;
      const back = document.querySelector<HTMLElement>("[data-thought-back]");
      const focusables = [
        ...(back ? [back] : []),
        ...el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ),
      ];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current ? focusables.includes(current) : false;
      if (event.shiftKey) {
        if (!inside || current === first || current === el) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  async function close(): Promise<void> {
    if (closing) return;
    closing = true;
    thoughtOverlay.closing = true;
    thoughtOverlay.setPush(0, 0);
    showDetail = false;
    // Shrink the title and the card together so the title does not lag behind.
    titleLarge = false;
    grown = false;
    if (!reduced()) await wait(380);
    card = false;
    closing = false;
    onclosed?.();
    requestAnimationFrame(() => el?.focus({ preventScroll: true }));
  }

  const target = $derived(cardTarget(viewport));
  const cardStyle = $derived(
    card && rect
      ? `position: fixed; z-index: 50; top: ${
          grown ? target.top : rect.top
        }px; left: ${grown ? target.left : rect.left}px; width: ${
          grown ? target.width : rect.width
        }px; height: ${grown ? target.height : rect.height}px;`
      : ""
  );

  const pushStyle = $derived(
    pushed === "up"
      ? `transform: translateY(-${thoughtOverlay.pushUp}px);`
      : pushed === "down"
        ? `transform: translateY(${thoughtOverlay.pushDown}px);`
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

<svelte:element
  this={card ? "div" : "a"}
  bind:this={el}
  href={card ? undefined : resolve(`/thoughts/${entry.id}`)}
  data-thought-id={entry.id}
  class="row -mx-4 block border-border px-4 py-5 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:-mx-3 md:px-3"
  class:border-t={!first}
  class:card
  class:title-large={titleLarge}
  class:pushed-up={pushed === "up"}
  class:pushed-down={pushed === "down"}
  class:show-detail={showDetail}
  role={card ? "dialog" : undefined}
  aria-label={card ? title : undefined}
  tabindex={card ? -1 : undefined}
  onkeydown={(event: KeyboardEvent) => {
    if (card && event.key === "Escape") close();
  }}
  style={card ? cardStyle : pushStyle}
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
  {#if summary && !titleLarge}
    <span
      transition:fade={{ duration: 200 }}
      class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
    >
      {summary}
    </span>
  {/if}
  {#if card}
    <div class="detail">
      <ThoughtDetailContent visible={showDetail} id={entry.id} />
    </div>
  {/if}
</svelte:element>

<style>
  .placeholder {
    width: 100%;
  }

  .row {
    transition:
      transform var(--m-dur-expand) var(--ease-out),
      opacity var(--m-dur-expand) var(--ease-out),
      background-color 150ms var(--ease-out);
  }

  .row.card {
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
  .row.card:hover {
    background: var(--background);
  }
  /* The card is focused as a dialog container; no ring on the whole surface. */
  .row.card:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .row-title {
    margin-top: 6px;
    font-weight: 600;
    letter-spacing: -0.011em;
    line-height: 1.34;
    font-size: 1.06rem;
    width: fit-content;
    transition: font-size var(--m-dur-expand) var(--ease-out);
  }
  .row.title-large .row-title {
    font-size: 2.25rem;
    line-height: 1.1;
    letter-spacing: -0.028em;
    /* Follow the card's width so the line breaks stay stable while it grows. */
    width: 100%;
  }

  .detail {
    pointer-events: none;
  }
  .row.card.show-detail .detail {
    pointer-events: auto;
  }

  .row.pushed-up,
  .row.pushed-down {
    opacity: 0;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .row,
    .row.card,
    .row-title,
    .detail {
      transition: none;
    }
  }
</style>
