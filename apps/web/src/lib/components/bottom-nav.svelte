<script lang="ts">
  import { page } from "$app/state";
  import NotebookIcon from "@lucide/svelte/icons/notebook";
  import PenLineIcon from "@lucide/svelte/icons/pen-line";
  import { isTabActive, tabs } from "$lib/navigation";
  import { cn } from "$lib/utils";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";

  const icons = { pen: PenLineIcon, notebook: NotebookIcon };
  const pathname = $derived(page.url.pathname);

  function handleClick(event: MouseEvent, href: string): void {
    if (!isTabActive(pathname, href)) return;

    event.preventDefault();
    document
      .querySelector<HTMLElement>("[data-scroll-container]")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<nav
  aria-label="Primary"
  inert={thoughtOverlay.activeId !== null}
  class="shrink-0 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
>
  <div
    class="mx-auto flex w-full max-w-[28rem] items-stretch gap-1 rounded-full bg-card/95 p-1.5 shadow-lg ring-1 ring-border/60 backdrop-blur"
  >
    {#each tabs as tab (tab.href)}
      {@const active = isTabActive(pathname, tab.href)}
      {@const Icon = icons[tab.icon]}
      <a
        href={tab.href}
        aria-current={active ? "page" : undefined}
        onclick={(event) => handleClick(event, tab.href)}
        class={cn(
          "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon class="size-5" aria-hidden="true" />
        <span>{tab.label}</span>
      </a>
    {/each}
  </div>
</nav>
