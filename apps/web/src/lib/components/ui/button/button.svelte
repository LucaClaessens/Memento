<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
  type Size = "default" | "sm" | "lg" | "icon";

  let {
    class: className = "",
    variant = "default",
    size = "default",
    children,
    ...rest
  }: {
    class?: string;
    variant?: Variant;
    size?: Size;
    children?: Snippet;
  } & HTMLButtonAttributes = $props();

  const variantClasses: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
    outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  };

  const sizeClasses: Record<Size, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-6",
    icon: "size-9",
  };
</script>

<button
  class={cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
    variantClasses[variant],
    sizeClasses[size],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</button>
