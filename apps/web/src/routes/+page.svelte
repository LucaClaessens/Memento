<script lang="ts">
  import { onMount } from "svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import CaptureForm from "$lib/components/capture-form.svelte";
  import EntryList from "$lib/components/entry-list.svelte";
  import { entries } from "$lib/stores/entries.svelte";

  onMount(() => {
    void entries.load();
  });

  function capture(rawText: string): Promise<boolean> {
    return entries.capture(rawText);
  }
</script>

<main class="mx-auto flex w-full max-w-xl flex-col gap-8 p-6">
  <header class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold tracking-tight">Memento</h1>
    <p class="text-sm text-muted-foreground">
      Capture a thought. It stays on your own machine.
    </p>
  </header>

  <CaptureForm
    submitting={entries.submitting}
    error={entries.submitError}
    oncapture={capture}
  />

  {#if entries.loadError}
    <Alert.Root variant="destructive">
      <Alert.Title>Couldn’t load</Alert.Title>
      <Alert.Description>{entries.loadError}</Alert.Description>
      <Alert.Action>
        <Button variant="outline" size="sm" onclick={() => entries.load()}>
          Retry
        </Button>
      </Alert.Action>
    </Alert.Root>
  {/if}

  <section class="flex flex-col gap-2" aria-labelledby="entries-heading">
    <h2 id="entries-heading" class="text-sm font-medium text-muted-foreground">
      Recent
    </h2>
    <EntryList entries={entries.entries} loading={entries.loading} />
  </section>
</main>
