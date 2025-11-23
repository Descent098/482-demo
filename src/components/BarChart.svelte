<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';

  let plotEl: HTMLElement;

  let plot:string|SVGSVGElement | HTMLElement = `<div></div>`

  onMount(()=>{
    plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
    plotEl.appendChild(plot);

  })
</script>

<style>
  /* small responsive wrapper */
  .plot-wrap { width: 100%; display: flex; justify-content: center; }
</style>


<div class="plot-wrap" bind:this={plotEl}></div>
