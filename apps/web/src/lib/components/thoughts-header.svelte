<script lang="ts">
  interface Props {
    small?: boolean;
    back?: boolean;
    scrolled?: boolean;
    onback?: () => void;
  }

  let {
    small = false,
    back = false,
    scrolled = false,
    onback,
  }: Props = $props();
</script>

<header class="thoughts-header" class:small class:back class:scrolled>
  <div class="topbar-gradient" aria-hidden="true"></div>
  <button
    type="button"
    class="back-arrow"
    data-thought-back
    aria-label="Back to thoughts"
    aria-hidden={!back}
    tabindex={back ? 0 : -1}
    onclick={onback}
  >
    ←
  </button>
  <h1 class="title">Thoughts</h1>
</header>

<style>
  .thoughts-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    height: 3.5rem;
    align-items: center;
    padding: 0;
    background: var(--background);
  }

  .topbar-gradient {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 1rem;
    background: linear-gradient(to bottom, var(--background), transparent);
    opacity: 0;
    transition: opacity 200ms var(--ease-out);
    pointer-events: none;
  }
  .scrolled .topbar-gradient {
    opacity: 1;
  }

  /* No line in the topbar. The arrow aligns with the row content's left edge. */
  .back-arrow {
    position: absolute;
    top: 50%;
    left: -0.9rem;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transform: translate(-0.35rem, -50%);
    pointer-events: none;
    transition:
      opacity 200ms var(--ease-out),
      transform 200ms var(--ease-out);
  }

  .back .back-arrow {
    opacity: 1;
    transform: translate(0, -50%);
    pointer-events: auto;
  }

  .back-arrow:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: 9999px;
  }

  .title {
    position: relative;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    font-size: 2.25rem;
    transition:
      font-size var(--m-dur-base) var(--ease-out),
      margin-left var(--m-dur-base) var(--ease-out);
    width: fit-content;
  }

  .small .title {
    font-size: 1.125rem;
  }

  .back .title {
    margin-left: 1.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .title,
    .back-arrow,
    .topbar-gradient {
      transition: none;
    }
  }
</style>
