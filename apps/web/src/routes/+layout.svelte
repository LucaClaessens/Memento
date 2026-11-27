<script lang="ts">
  import { onMount } from "svelte";
  import BottomNav from "$lib/components/bottom-nav.svelte";
  import { navigation } from "$lib/stores/navigation.svelte";
  import "../app.css";

  onMount(() => navigation.attach());
</script>

<div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
  <div class="flex min-h-0 flex-1 flex-col">
    <slot />
  </div>

  {#if !navigation.keyboardOpen}
    <BottomNav />
  {/if}
</div>
