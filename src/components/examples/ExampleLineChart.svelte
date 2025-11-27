<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Plot from '@observablehq/plot';

  let container: HTMLElement;
  let plotNode: Node | null = null;

  // inline generated sine-like data
  const data = Array.from({ length: 120 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 8) * (1 + Math.random() * 0.25) + (Math.random() - 0.5) * 0.2
  }));

  onMount(() => {
    // create an Observable Plot line chart
    const plot = Plot.plot({
      width: 720,
      height: 320,
      margin: 40,
      x: {
        label: 'index'
      },
      y: {
        label: 'value'
      },
      marks: [
        Plot.line(data, { x: 'x', y: 'y' }),
        Plot.dot(data, { x: 'x', y: 'y' }) // optional dots
      ]
    });

    // append and keep reference for cleanup
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
