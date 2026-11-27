<script lang="ts">
  import { MAX_ENTRY_LENGTH } from "@memento/shared";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import { entries } from "$lib/stores/entries.svelte";
  import MicIcon from "@lucide/svelte/icons/mic";

  import SendIcon from "@lucide/svelte/icons/send";
  import XIcon from "@lucide/svelte/icons/x";
  import CheckIcon from "@lucide/svelte/icons/check";

  let text = $state("");
  let textareaRef: HTMLTextAreaElement | null = $state(null);
  let announcement = $state("");
  let recording = $state(false);
  let elapsed = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array<ArrayBuffer> | null = $state(null);
  let waveLevels = $state<number[]>(Array(24).fill(0));

  const tooLong = $derived(text.length > MAX_ENTRY_LENGTH);
  const canSubmit = $derived(
    text.trim().length > 0 && !tooLong && !entries.submitting
  );

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  async function startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      mediaRecorder = new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start();
      recording = true;
      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
          waveLevels = Array.from({ length: 24 }, (_, i) => {
            const idx = Math.floor((i / 24) * dataArray!.length);
            return dataArray![idx] / 255;
          });
        }
      }, 50);
    } catch {
      entries.submitError = "Microphone access denied.";
    }
  }

  function cancelRecording(): void {
    if (mediaRecorder && recording) {
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
    audioContext?.close();
    audioContext = null;
    analyser = null;
    recording = false;
    stopTimer();
    chunks = [];
    elapsed = 0;
    waveLevels = Array(24).fill(0);
  }

  async function acceptRecording(): Promise<void> {
    if (!mediaRecorder) return;
    const rec = mediaRecorder;
    const blobPromise = new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        resolve(blob);
      };
    });
    rec.stop();
    rec.stream.getTracks().forEach((t) => t.stop());
    const blob = await blobPromise;
    audioContext?.close();
    audioContext = null;
    analyser = null;
    recording = false;
    stopTimer();
    elapsed = 0;
    waveLevels = Array(24).fill(0);
    await entries.captureVoice(blob);
  }

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
</script>

<svelte:head>
  <title>Memento</title>
</svelte:head>

<div class="flex h-full min-h-0 flex-col">
  <div
    class="mx-auto flex w-full max-w-[720px] min-h-0 flex-1 flex-col px-4 md:px-0"
  >
    <!-- Reserved prompt slot (empty in v1). -->
    <div class="min-h-0 shrink-0" aria-hidden="true" data-slot="prompt"></div>

    <div class="flex min-h-0 flex-1 flex-col">
      <Textarea
        bind:ref={textareaRef}
        bind:value={text}
        aria-label="Capture a thought"
        placeholder="What's on your mind?"
        class="min-h-0 flex-1 resize-none border-0 bg-transparent px-0 pt-8 pb-4 text-2xl leading-[1.45] shadow-none focus-visible:ring-0 md:pt-12 md:pb-6 md:text-[1.75rem]"
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
      {#if recording}
        <button
          type="button"
          class="size-10 shrink-0 rounded-full border border-border flex items-center justify-center text-destructive animate-pulse"
          aria-label="Recording"
          data-slot="record-control"
        >
          <MicIcon class="size-5" />
        </button>
        <div class="flex flex-1 items-center gap-2 px-2">
          <div class="flex items-center gap-0.5 h-7">
            {#each waveLevels as level, i (i)}
              <span
                class="w-1 rounded-sm bg-primary"
                style="height: {Math.max(2, level * 28)}px"
              ></span>
            {/each}
          </div>
          <span class="text-xs tabular-nums text-muted-foreground ml-auto">
            {Math.floor(elapsed / 10)}s
          </span>
        </div>
        <button
          type="button"
          class="size-9 shrink-0 rounded-full border border-border flex items-center justify-center text-muted-foreground"
          aria-label="Cancel recording"
          onclick={() => cancelRecording()}
        >
          <XIcon class="size-4" />
        </button>
        <button
          type="button"
          class="size-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          aria-label="Accept recording"
          onclick={() => void acceptRecording()}
        >
          <CheckIcon class="size-4" />
        </button>
      {:else}
        <button
          type="button"
          class="size-10 shrink-0 rounded-full border border-border flex items-center justify-center"
          aria-label="Start recording"
          data-slot="record-control"
          onclick={() => void startRecording()}
        >
          <MicIcon class="size-5" />
        </button>
        <span class="flex-1 text-center text-xs text-muted-foreground">
          ⌘↵ to save
        </span>
        <Button
          type="submit"
          disabled={!canSubmit}
          onclick={() => void submit()}
          class="size-9 p-0"
          aria-label="Capture"
        >
          {#if entries.submitting}
            <Spinner data-icon="inline-start" />
          {:else}
            <SendIcon class="size-4" />
          {/if}
        </Button>
      {/if}
    </div>
  </div>

  <span class="sr-only" aria-live="polite" role="status">{announcement}</span>
</div>
