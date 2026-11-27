<script lang="ts">
  import { MAX_ENTRY_LENGTH } from "@memento/shared";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import { thoughtDetail } from "$lib/stores/app.svelte";
  import { formatThoughtDate, splitThought } from "$lib/thoughts";

  let { visible = false, id = "" }: { visible?: boolean; id?: string } =
    $props();

  const display = $derived(
    thoughtDetail.thought ? splitThought(thoughtDetail.thought) : null
  );

  let followUp = $state("");
  let textareaRef: HTMLTextAreaElement | null = $state(null);
  let announcement = $state("");

  const tooLong = $derived(followUp.length > MAX_ENTRY_LENGTH);
  const canSubmit = $derived(
    followUp.trim().length > 0 && !tooLong && !thoughtDetail.submitting
  );

  async function submitFollowUp(): Promise<void> {
    if (!canSubmit || !thoughtDetail.thought) {
      return;
    }

    const added = await thoughtDetail.addFollowUp(
      thoughtDetail.thought.id,
      followUp
    );
    if (!added) {
      return;
    }

    followUp = "";
    announcement = "";
    setTimeout(() => {
      announcement = "Follow-up added.";
    }, 0);
    requestAnimationFrame(() => textareaRef?.focus());
  }

  function handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submitFollowUp();
    }
  }
</script>

<div class={["detail-content", { visible }]}>
  {#if thoughtDetail.loading || (!thoughtDetail.thought && !thoughtDetail.notFound && !thoughtDetail.loadError)}
    <div class="flex flex-col gap-3" aria-busy="true">
      <span class="sr-only" role="status">Loading thought…</span>
      <Skeleton class="h-2.5 w-20" />
      <Skeleton class="h-8 w-3/4" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-5/6" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  {:else if thoughtDetail.notFound}
    <Alert.Root variant="destructive">
      <Alert.Title>Thought not found</Alert.Title>
      <Alert.Description>
        This thought may have been removed, or the link is wrong.
      </Alert.Description>
    </Alert.Root>
  {:else if thoughtDetail.loadError}
    <Alert.Root variant="destructive">
      <Alert.Title>Couldn’t load this thought</Alert.Title>
      <Alert.Description>{thoughtDetail.loadError}</Alert.Description>
      <div class="mt-3">
        <Button
          variant="outline"
          size="sm"
          onclick={() => void thoughtDetail.load(id)}
        >
          Retry
        </Button>
      </div>
    </Alert.Root>
  {:else if thoughtDetail.thought && display}
    {#if display.body}
      <div
        class="mt-5 text-base leading-[1.7] whitespace-pre-wrap wrap-break-word md:text-[1.0625rem]"
      >
        {display.body}
      </div>
    {/if}

    <section class="mt-10" aria-labelledby="thread-heading">
      <div class="flex items-center gap-3">
        <h2
          id="thread-heading"
          class="text-[0.7rem] font-semibold tracking-[0.07em] text-muted-foreground uppercase"
        >
          Thread
        </h2>
        <Separator class="flex-1" />
      </div>

      {#if thoughtDetail.followUps.length === 0}
        <p class="py-4 text-sm text-muted-foreground">No follow-ups yet.</p>
      {:else}
        <ol class="mt-2">
          {#each thoughtDetail.followUps as followUpEntry (followUpEntry.id)}
            <li class="border-l-2 border-border py-3 pl-4">
              <time
                class="block text-[0.69rem] leading-none text-muted-foreground"
                datetime={followUpEntry.createdAt}
              >
                {formatThoughtDate(followUpEntry.createdAt)}
              </time>
              <p
                class="mt-1 text-[0.94rem] leading-relaxed whitespace-pre-wrap wrap-break-word"
              >
                {followUpEntry.rawText}
              </p>
            </li>
          {/each}
        </ol>
      {/if}

      <form
        class="mt-4 border-t border-border pt-4"
        onsubmit={(event) => {
          event.preventDefault();
          void submitFollowUp();
        }}
      >
        <Textarea
          bind:ref={textareaRef}
          bind:value={followUp}
          aria-label="Add a follow-up"
          placeholder="Add a follow-up…"
          class="min-h-16 resize-none border-0 bg-transparent px-0 py-2 text-base shadow-none focus-visible:ring-0"
          disabled={thoughtDetail.submitting}
          onkeydown={handleKeydown}
        />
        <div class="flex items-center justify-between gap-3 pt-2">
          <span class="text-xs text-muted-foreground">
            {#if followUp.length > MAX_ENTRY_LENGTH - 1_000}
              {followUp.length.toLocaleString()} / {MAX_ENTRY_LENGTH.toLocaleString()}
            {:else}
              ⌘↵ to add
            {/if}
          </span>
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {#if thoughtDetail.submitting}
              <Spinner data-icon="inline-start" />
            {/if}
            Add
          </Button>
        </div>
        {#if tooLong}
          <p class="pt-1 text-xs text-destructive">
            Keep under {MAX_ENTRY_LENGTH.toLocaleString()} characters.
          </p>
        {/if}
      </form>

      {#if thoughtDetail.submitError}
        <Alert.Root variant="destructive" class="mt-3">
          <Alert.Title>Couldn’t add your follow-up</Alert.Title>
          <Alert.Description>{thoughtDetail.submitError}</Alert.Description>
        </Alert.Root>
      {/if}

      <span class="sr-only" aria-live="polite" role="status">
        {announcement}
      </span>
    </section>
  {/if}
</div>

<style>
  .detail-content {
    opacity: 0;
    transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .detail-content.visible {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .detail-content {
      transition: none;
    }
  }
</style>
