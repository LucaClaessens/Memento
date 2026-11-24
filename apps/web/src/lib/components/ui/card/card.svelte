<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  let {
    class: className = "",
    children,
    ...rest
  }: {
    class?: string;
    children?: Snippet;
  } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
  class={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}
  {...rest}
>
  {@render children?.()}
</div>
