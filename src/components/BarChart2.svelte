<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Plot from '@observablehq/plot';

  let container: HTMLElement;
  let plotNode: Node | null = null;

  // inline category data
  const data = Array.from({ length: 8 }, (_, i) => ({
    name: `Category ${i + 1}`,
    value: Math.round(Math.random() * 90) + 10
  }));

  onMount(() => {
    const plot = Plot.plot({
      width: 720,
      height: 360,
    //   margin: 36,
      x: { label: 'category' },
      y: { label: 'value' },
      marks: [
        Plot.barY(data, { x: 'name', y: 'value' }),
        Plot.ruleY([0])
      ]
    });

    plotNode = plot;
    container.appendChild(plot);
  });

  onDestroy(() => {
    if (plotNode && plotNode.parentNode) plotNode.parentNode.removeChild(plotNode);
    else if (container) container.innerHTML = '';
  });
</script>

<style>
  .plot-wrap { width: 100%; display: flex; justify-content: center; }
</style>

<div class="plot-wrap">
  <div bind:this={container}></div>
</div>
