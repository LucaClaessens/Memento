<script lang="ts">
  import { onMount } from "svelte";
  import { BRAND, greetingFor, longDateFormatter } from "$lib/navigation";

  let now = $state(new Date());
  const greeting = $derived(greetingFor(now));
  const date = $derived(longDateFormatter.format(now));

  function refresh(): void {
    now = new Date();
  }

  onMount(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  });
</script>

<div class="pt-6 md:pt-10">
  <p
    class="text-[0.7rem] font-medium tracking-[0.12em] text-muted-foreground uppercase"
  >
    {BRAND}
  </p>
  <h1 class="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
    {greeting}
  </h1>
  <p class="mt-1 text-sm text-muted-foreground">{date}</p>
</div>
