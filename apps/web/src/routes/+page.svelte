<script lang="ts">
  import { onMount } from "svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import { entries } from "$lib/stores/entries.svelte";

  const MAX_LENGTH = 10_000;

  let text = $state("");
  let textareaRef: HTMLTextAreaElement | null = $state(null);
  let announcement = $state("");

  const tooLong = $derived(text.length > MAX_LENGTH);
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

<div class="flex h-dvh flex-col bg-background text-foreground">
  <header
    class="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 md:h-14 md:px-8"
  >
    <span class="text-base font-semibold tracking-tight">Memento</span>
    <a
      href="/thoughts"
      class="text-sm text-muted-foreground hover:text-foreground"
    >
      Thoughts
    </a>
  </header>

  <div
    class="mx-auto flex w-full max-w-[720px] flex-1 flex-col min-h-0 px-4 md:px-0"
  >
    <!-- Reserved prompt slot (empty in v1). -->
    <div class="min-h-0 shrink-0" aria-hidden="true" data-slot="prompt"></div>

    <div class="flex flex-1 flex-col min-h-0">
      <Textarea
        bind:ref={textareaRef}
        bind:value={text}
        aria-label="Capture a thought"
        placeholder="What's on your mind?"
        class="flex-1 min-h-0 resize-none border-0 bg-transparent px-0 py-4 text-lg leading-[1.6] shadow-none focus-visible:ring-0 md:py-6"
        disabled={entries.submitting}
        onkeydown={handleKeydown}
      />
    </div>

    <div class="shrink-0 py-1 text-right text-xs text-muted-foreground">
      {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
      {#if tooLong}
        <span class="text-destructive">
          — keep under {MAX_LENGTH} characters.
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
      class="flex shrink-0 items-center gap-2 border-t border-border py-3 md:gap-3 md:py-4"
    >
      <!-- Reserved 40px record-control slot (filled by #3). -->
      <div
        class="h-10 w-10 shrink-0"
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
