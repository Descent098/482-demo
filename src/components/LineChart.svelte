<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';

  let lineEl: HTMLElement;
  let linePlot: HTMLElement | SVGSVGElement | string = "<div></div>";

  // Generate sample data
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10) + Math.random() * 0.2
  }));

  onMount(() => {
    linePlot = Plot.plot({
      width: 600,
      height: 300,
      marks: [
        Plot.line(data, { x: "x", y: "y", stroke: "steelblue" })
      ]
    });

    lineEl.appendChild(linePlot);
  });
</script>

<style>
  .plot-wrap { width: 100%; display: flex; justify-content: center; }
</style>


<div class="plot-wrap" bind:this={lineEl}></div>
