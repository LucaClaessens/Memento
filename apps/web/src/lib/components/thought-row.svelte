<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Entry } from "@memento/shared";
  import {
    formatThoughtDate,
    thoughtSummary,
    thoughtTitle,
  } from "$lib/thoughts";

  interface Props {
    entry: Entry;
    now?: Date;
  }

  let { entry, now }: Props = $props();

  const title = $derived(thoughtTitle(entry));
  const summary = $derived(thoughtSummary(entry));
  const dateLabel = $derived(formatThoughtDate(entry.createdAt, now));

  let titleEl: HTMLSpanElement | null = $state(null);

  function handleClick(): void {
    if (titleEl) titleEl.style.viewTransitionName = "row-title";
  }
</script>

<a
  href={resolve(`/thoughts/${entry.id}`)}
  onclick={handleClick}
  class="-mx-4 block px-4 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:-mx-3 md:px-3"
>
  <time
    class="mb-1.5 block text-[0.69rem] leading-none text-muted-foreground"
    datetime={entry.createdAt}
  >
    {dateLabel}
  </time>
  <span
    bind:this={titleEl}
    class="line-clamp-2 text-[1.06rem] leading-[1.34] font-semibold tracking-[-0.011em]"
    style:width="fit-content"
  >
    {title}
  </span>
  {#if summary}
    <span
      class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
    >
      {summary}
    </span>
  {/if}
</a>
