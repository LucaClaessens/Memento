<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import * as Field from "$lib/components/ui/field";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";

  interface Props {
    submitting?: boolean;
    error?: string | null;
    oncapture: (rawText: string) => Promise<boolean>;
  }

  let { submitting = false, error = null, oncapture }: Props = $props();

  const MAX_LENGTH = 10_000;

  let text = $state("");
  const tooLong = $derived(text.length > MAX_LENGTH);
  const canSubmit = $derived(text.trim().length > 0 && !tooLong && !submitting);

  async function submit(): Promise<void> {
    if (!canSubmit) return;

    const captured = await oncapture(text);
    if (captured) text = "";
  }

  function handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  }
</script>

<form
  class="flex flex-col gap-4"
  onsubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
>
  <Field.FieldGroup>
    <Field.Field data-invalid={tooLong ? "true" : undefined}>
      <Field.Label for="capture-text">Capture</Field.Label>
      <Textarea
        id="capture-text"
        bind:value={text}
        placeholder="What’s on your mind?"
        rows={5}
        aria-invalid={tooLong || undefined}
        onkeydown={handleKeydown}
      />
      <Field.Description>
        Stored exactly as you type it. {text.length}/{MAX_LENGTH} characters.
      </Field.Description>
      {#if tooLong}
        <Field.Error>Keep the entry under 10,000 characters.</Field.Error>
      {/if}
    </Field.Field>
    <Field.Field orientation="horizontal">
      <Button type="submit" disabled={!canSubmit}>
        {#if submitting}
          <Spinner data-icon="inline-start" />
        {/if}
        Capture
      </Button>
    </Field.Field>
  </Field.FieldGroup>

  {#if error}
    <Alert.Root variant="destructive">
      <Alert.Title>Couldn’t save</Alert.Title>
      <Alert.Description>{error}</Alert.Description>
    </Alert.Root>
  {/if}
</form>
