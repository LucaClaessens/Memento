<script lang="ts">
  interface Props {
    left?: { href: string; label: string } | null;
    right?: { href: string; label: string } | null;
  }

  let { left = null, right = null }: Props = $props();

  const linkClass =
    "rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
</script>

<header
  class="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 md:h-14 md:px-8"
>
  {#if left}
    <a href={left.href} class={linkClass}>{left.label}</a>
  {:else}
    <a
      href="/"
      class="rounded-sm text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      Memento
    </a>
  {/if}

  {#if right}
    <a href={right.href} class={linkClass}>{right.label}</a>
  {/if}
</header>
