<script lang="ts">
  import { MAX_ENTRY_LENGTH } from "@memento/shared";
  import { onMount } from "svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import WriteGreeting from "$lib/components/write-greeting.svelte";
  import { entries } from "$lib/stores/entries.svelte";

  let text = $state("");
  let textareaRef: HTMLTextAreaElement | null = $state(null);
  let announcement = $state("");

  const tooLong = $derived(text.length > MAX_ENTRY_LENGTH);
  const canSubmit = $derived(
    text.trim().length > 0 && !tooLong && !entries.submitting
  );

  async function submit(): Promise<void> {
    if (!canSubmit) return;

    const captured = await entries.capture(text);
    if (captured) {
      text = "";
      announcement = "";
      // Defer so the screen reader announces the repeated "Saved.".
      setTimeout(() => {
        announcement = "Saved.";
      }, 0);
      // Return focus to the textarea.
      requestAnimationFrame(() => {
        textareaRef?.focus();
      });
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  }

  onMount(() => {
    textareaRef?.focus();
  });
</script>

<svelte:head>
  <title>Memento</title>
</svelte:head>

<div class="flex h-full min-h-0 flex-col">
  <div
    class="mx-auto flex w-full max-w-[720px] min-h-0 flex-1 flex-col px-4 md:px-0"
  >
    <WriteGreeting />

    <!-- Reserved prompt slot (empty in v1). -->
    <div class="min-h-0 shrink-0" aria-hidden="true" data-slot="prompt"></div>

    <div class="flex min-h-0 flex-1 flex-col">
      <Textarea
        bind:ref={textareaRef}
        bind:value={text}
        aria-label="Capture a thought"
        placeholder="What's on your mind?"
        class="min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-4 text-lg leading-[1.6] shadow-none focus-visible:ring-0 md:py-6"
        disabled={entries.submitting}
        onkeydown={handleKeydown}
      />
    </div>

    <div class="shrink-0 py-1 text-right text-xs text-muted-foreground">
      {text.length.toLocaleString()} / {MAX_ENTRY_LENGTH.toLocaleString()}
      {#if tooLong}
        <span class="text-destructive">
          — keep under {MAX_ENTRY_LENGTH.toLocaleString()} characters.
        </span>
      {/if}
    </div>

    {#if entries.submitError}
      <div class="shrink-0 pb-2">
        <Alert.Root variant="destructive">
          <Alert.Title>Couldn’t save</Alert.Title>
          <Alert.Description>{entries.submitError}</Alert.Description>
        </Alert.Root>
      </div>
    {/if}

    <div
      class="flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-card/70 p-2 md:gap-3"
    >
      <!-- Reserved 40px record-control slot (filled by #3). -->
      <div
        class="size-10 shrink-0"
        aria-hidden="true"
        data-slot="record-control"
      ></div>
      <span class="flex-1 text-center text-xs text-muted-foreground">
        ⌘↵ to save
      </span>
      <Button type="submit" disabled={!canSubmit} onclick={() => void submit()}>
        {#if entries.submitting}
          <Spinner data-icon="inline-start" />
        {/if}
        Capture
      </Button>
    </div>
  </div>

  <span class="sr-only" aria-live="polite" role="status">{announcement}</span>
</div>
