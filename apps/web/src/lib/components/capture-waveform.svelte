<script lang="ts">
  interface Props {
    analyser: AnalyserNode | null;
  }

  let { analyser }: Props = $props();

  const BAR_WIDTH = 2;
  const BAR_GAP = 3;
  const BAR_PITCH = BAR_WIDTH + BAR_GAP;
  const SAMPLE_MS = 60;
  const LEVEL_CURVE = 0.65;

  let canvas: HTMLCanvasElement | null = $state(null);

  $effect(() => {
    const el = canvas;
    const node = analyser;
    if (!el || !node) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let color = getComputedStyle(el).color;
    let levels: number[] = [];
    let peak = 0;
    let raf = 0;
    let lastSampleAt = 0;
    let data: Uint8Array<ArrayBuffer> | null = null;

    const draw = (width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      const capacity = Math.max(1, Math.floor(width / BAR_PITCH));
      while (levels.length > capacity) levels.shift();

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = BAR_WIDTH;
      ctx.lineCap = "round";

      const centerY = height / 2;
      const maxHeight = Math.max(BAR_WIDTH, height);
      const rightX = width - BAR_WIDTH / 2;

      for (let i = 0; i < levels.length; i++) {
        const x = rightX - (levels.length - 1 - i) * BAR_PITCH;
        if (x < BAR_WIDTH / 2) continue;
        const barHeight =
          BAR_WIDTH +
          (maxHeight - BAR_WIDTH) * Math.pow(levels[i], LEVEL_CURVE);
        const half = (barHeight - BAR_WIDTH) / 2;
        ctx.beginPath();
        if (half < 0.25) {
          ctx.arc(x, centerY, BAR_WIDTH / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(x, centerY - half);
          ctx.lineTo(x, centerY + half);
          ctx.stroke();
        }
      }
    };

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      el.width = Math.max(1, Math.round(rect.width * dpr));
      el.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(el).color;
      draw(rect.width, rect.height);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - lastSampleAt < SAMPLE_MS) return;
      lastSampleAt = now;

      if (!data || data.length !== node.fftSize) {
        data = new Uint8Array(node.fftSize);
      }
      node.getByteTimeDomainData(data);

      let max = 0;
      for (let i = 0; i < data.length; i++) {
        const value = Math.abs(data[i] - 128) / 128;
        if (value > max) max = value;
      }
      // Keep the peak between samples so a short syllable stays visible.
      peak = Math.max(peak, max);
      levels.push(peak);
      peak = 0;

      const rect = el.getBoundingClientRect();
      draw(rect.width, rect.height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="h-7 w-full text-destructive"
  aria-hidden="true"
></canvas>
