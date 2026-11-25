<script lang="ts">
  import type { Entry } from "@memento/shared";
  import * as Empty from "$lib/components/ui/empty";
  import { Separator } from "$lib/components/ui/separator";

  interface Props {
    entries: Entry[];
    loading?: boolean;
  }

  let { entries, loading = false }: Props = $props();

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
</script>

{#if loading && entries.length === 0}
  <p class="text-sm text-muted-foreground">Loading…</p>
{:else if entries.length === 0}
  <Empty.Root>
    <Empty.Header>
      <Empty.Title>Nothing captured yet.</Empty.Title>
      <Empty.Description>
        Type a thought above and capture it.
      </Empty.Description>
    </Empty.Header>
  </Empty.Root>
{:else}
  <ul class="flex flex-col">
    {#each entries as entry, index (entry.id)}
      <li class="flex flex-col gap-2 py-4">
        <p class="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {entry.rawText}
        </p>
        <time class="text-xs text-muted-foreground" datetime={entry.createdAt}>
          {dateFormatter.format(new Date(entry.createdAt))}
        </time>
      </li>
      {#if index < entries.length - 1}
        <Separator />
      {/if}
    {/each}
  </ul>
{/if}
