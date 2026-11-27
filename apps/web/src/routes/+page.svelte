<script lang="ts">
  import { MAX_ENTRY_LENGTH } from "@memento/shared";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import CaptureWaveform from "$lib/components/capture-waveform.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Textarea } from "$lib/components/ui/textarea";
  import { entries } from "$lib/stores/entries.svelte";
  import { entriesApi } from "$lib/api";
  import MicIcon from "@lucide/svelte/icons/mic";

  import SendIcon from "@lucide/svelte/icons/send";
  import XIcon from "@lucide/svelte/icons/x";
  import CheckIcon from "@lucide/svelte/icons/check";

  let text = $state("");
  let textareaRef: HTMLTextAreaElement | null = $state(null);
  let announcement = $state("");
  let recording = $state(false);
  let transcribing = $state(false);
  let transcribeController: AbortController | null = null;
  let elapsed = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Array<Blob> = [];
  let audioContext: AudioContext | null = null;
  let analyser = $state.raw<AnalyserNode | null>(null);

  const tooLong = $derived(text.length > MAX_ENTRY_LENGTH);
  const nearLimit = $derived(text.length > MAX_ENTRY_LENGTH - 1000);
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
      analyser.fftSize = 1024;
      source.connect(analyser);

      mediaRecorder = new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      mediaRecorder.start();
      recording = true;
      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
      }, 1000);
    } catch {
      entries.submitError = "Microphone access denied.";
    }
  }

  function cancelRecording(): void {
    transcribeController?.abort();
    transcribeController = null;
    transcribing = false;
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
  }

  async function acceptRecording(): Promise<void> {
    if (!mediaRecorder) {
      return;
    }
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
    transcribing = true;
    transcribeController = new AbortController();
    try {
      const transcript = await entriesApi.transcribeAudio(
        blob,
        transcribeController.signal
      );
      text = text.trim() ? `${text.trim()} ${transcript}` : transcript;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        entries.submitError = "Couldn’t transcribe the recording.";
      }
    } finally {
      transcribing = false;
      transcribeController = null;
    }
  }

  async function submit(): Promise<void> {
    if (!canSubmit) {
      return;
    }

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

    {#if entries.submitError}
      <div class="shrink-0 pb-2">
        <Alert.Root variant="destructive">
          <Alert.Title>Couldn’t capture</Alert.Title>
          <Alert.Description>{entries.submitError}</Alert.Description>
        </Alert.Root>
      </div>
    {/if}

    <div
      class="flex min-h-14 shrink-0 items-center gap-2 rounded-2xl bg-card p-2 shadow-sm ring-1 ring-border/60 md:gap-3"
    >
      {#if recording}
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-destructive shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Recording"
          data-slot="record-control"
        >
          <MicIcon class="size-5" />
        </button>
        <div class="flex min-w-0 flex-1 items-center gap-2 px-2">
          <div class="min-w-0 flex-1">
            <CaptureWaveform {analyser} />
          </div>
          <span
            class="size-1.5 shrink-0 rounded-full bg-destructive motion-safe:animate-pulse"
            aria-hidden="true"
          ></span>
          <span class="shrink-0 text-xs tabular-nums text-muted-foreground">
            {elapsed}s
          </span>
        </div>
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cancel recording"
          onclick={() => cancelRecording()}
        >
          <XIcon class="size-4" />
        </button>
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Accept recording"
          onclick={() => void acceptRecording()}
        >
          <CheckIcon class="size-4" />
        </button>
      {:else if transcribing}
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-info"
          aria-label="Transcribing"
          role="status"
        >
          <Spinner class="size-5" />
        </div>
        <span class="flex-1 text-center text-xs text-info">Transcribing…</span>
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cancel transcription"
          onclick={() => cancelRecording()}
        >
          <XIcon class="size-4" />
        </button>
      {:else}
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Start recording"
          data-slot="record-control"
          onclick={() => void startRecording()}
        >
          <MicIcon class="size-5" />
        </button>
        <span
          class="flex-1 text-center text-xs {tooLong
            ? 'text-destructive'
            : 'text-muted-foreground'}"
        >
          {#if nearLimit}
            {text.length.toLocaleString()} / {MAX_ENTRY_LENGTH.toLocaleString()}
          {:else}
            <span class="hidden md:inline">⌘↵ to save</span>
          {/if}
        </span>
        <Button
          type="submit"
          disabled={!canSubmit}
          onclick={() => void submit()}
          class="size-10 rounded-full p-0"
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
