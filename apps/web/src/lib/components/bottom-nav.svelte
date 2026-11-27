<script lang="ts">
  import { page } from "$app/state";
  import NotebookIcon from "@lucide/svelte/icons/notebook";
  import PenLineIcon from "@lucide/svelte/icons/pen-line";
  import { isTabActive, tabs } from "$lib/navigation";
  import { cn } from "$lib/utils";
  import { thoughtOverlay } from "$lib/stores/thought-overlay.svelte";

  const icons = { pen: PenLineIcon, notebook: NotebookIcon };
  const pathname = $derived(page.url.pathname);
  const activeIndex = $derived(
    tabs.findIndex((tab) => isTabActive(pathname, tab.href))
  );

  let container: HTMLDivElement | null = $state(null);
  let tabEls: HTMLElement[] = $state([]);
  let indicator = $state({ x: 0, width: 0 });
  let ready = $state(false);

  $effect(() => {
    const el = tabEls[activeIndex];
    if (!el || !container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    indicator = {
      x: rect.left - containerRect.left,
      width: rect.width,
    };
    if (!ready) {
      requestAnimationFrame(() => (ready = true));
    }
  });

  $effect(() => {
    const remeasure = () => {
      const el = tabEls[activeIndex];
      if (!el || !container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      indicator = { x: rect.left - containerRect.left, width: rect.width };
    };
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  });

  function handleClick(event: MouseEvent, href: string): void {
    if (!isTabActive(pathname, href)) {
      return;
    }

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
    bind:this={container}
    class="relative mx-auto flex w-full max-w-[28rem] items-stretch gap-1 rounded-full bg-card/95 p-1.5 shadow-lg ring-1 ring-border/60 backdrop-blur"
  >
    <span
      class={cn(
        "pointer-events-none absolute top-1.5 bottom-1.5 left-0 z-0 rounded-full bg-primary motion-reduce:transition-none",
        ready &&
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      )}
      style:width={`${indicator.width}px`}
      style:transform={`translateX(${indicator.x}px)`}
      aria-hidden="true"
    ></span>
    {#each tabs as tab, index (tab.href)}
      {@const active = isTabActive(pathname, tab.href)}
      {@const Icon = icons[tab.icon]}
      <a
        bind:this={tabEls[index]}
        href={tab.href}
        aria-current={active ? "page" : undefined}
        onclick={(event) => handleClick(event, tab.href)}
        class={cn(
          "relative z-10 flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          active
            ? "text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon class="size-5" aria-hidden="true" />
        <span>{tab.label}</span>
      </a>
    {/each}
  </div>
</nav>
