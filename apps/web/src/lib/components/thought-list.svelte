<script lang="ts">
  import type { Entry } from "@memento/shared";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import * as Empty from "$lib/components/ui/empty";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import ThoughtRow from "./thought-row.svelte";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";
  import { pushDirection } from "$lib/thoughts-transition";

  interface Props {
    entries: Array<Entry>;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
  }

  let { entries, loading = false, error = null, onRetry }: Props = $props();

  const now = new Date();
  const activeIndex = $derived(
    entries.findIndex((entry) => entry.id === thoughtOverlay.activeId)
  );
</script>

{#if loading && entries.length === 0}
  <div class="flex flex-col" aria-busy="true">
    <span class="sr-only" role="status">Loading thoughts…</span>
    {#each Array(3) as _, index (index)}
      <div
        class="flex flex-col gap-2 border-t border-border py-5 first:border-t-0"
        aria-hidden="true"
      >
        <Skeleton class="h-2.5 w-16" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-full" />
        <Skeleton class="h-3 w-2/3" />
      </div>
    {/each}
  </div>
{:else if error && entries.length === 0}
  <Alert.Root variant="destructive">
    <Alert.Title>Couldn’t load your thoughts</Alert.Title>
    <Alert.Description>{error}</Alert.Description>
    {#if onRetry}
      <div class="mt-3">
        <Button variant="outline" size="sm" onclick={onRetry}>Retry</Button>
      </div>
    {/if}
  </Alert.Root>
{:else if entries.length === 0}
  <Empty.Root>
    <Empty.Header>
      <Empty.Title>No thoughts yet.</Empty.Title>
      <Empty.Description>Capture one to get started.</Empty.Description>
    </Empty.Header>
    <Button variant="outline" href="/">Write one →</Button>
  </Empty.Root>
{:else}
  {#if error}
    <Alert.Root variant="destructive" class="mb-4">
      <Alert.Title>Couldn’t refresh your thoughts</Alert.Title>
      <Alert.Description>{error}</Alert.Description>
      {#if onRetry}
        <div class="mt-3">
          <Button variant="outline" size="sm" onclick={onRetry}>Retry</Button>
        </div>
      {/if}
    </Alert.Root>
  {/if}

  <ul
    class="flex flex-col"
    inert={activeIndex === -1 && thoughtOverlay.activeId !== null}
  >
    {#each entries as entry, index (entry.id)}
      {@const pushed = thoughtOverlay.closing
        ? null
        : pushDirection(index, activeIndex)}
      <li inert={activeIndex !== -1 && index !== activeIndex}>
        <ThoughtRow
          {entry}
          {now}
          active={thoughtOverlay.activeId === entry.id}
          first={index === 0}
          {pushed}
          onclosed={() => thoughtOverlay.finishClose()}
        />
      </li>
    {/each}
  </ul>
{/if}
