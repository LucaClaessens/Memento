<script lang="ts">
  import { onMount } from "svelte";
  import { onNavigate } from "$app/navigation";
  import type { Snippet } from "svelte";
  import BottomNav from "$lib/components/bottom-nav.svelte";
  import { navigation } from "$lib/stores/navigation.svelte";
  import "../app.css";

  let { children }: { children: Snippet } = $props();

  onMount(() => navigation.attach());

  // View Transitions API: wrap navigations so shared elements (e.g. a thought title)
  // morph between list and detail. Falls back to a normal navigation when unsupported
  // or when the user prefers reduced motion.
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
  <div class="flex min-h-0 flex-1 flex-col">
    {@render children()}
  </div>

  {#if !navigation.keyboardOpen}
    <BottomNav />
  {/if}
</div>
