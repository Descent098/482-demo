<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import ObservableChart from "../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../scripts/utilities"

  let plot:string|SVGSVGElement | HTMLElement = $state(`<div></div>`)
  let initialized = $state(false)

  const {
          yAxisDataField,           // The field to use for the data for the y axis
          
          // Optional Fields
          title="",                 // The title of the chart
          subtitle="",              // The subtitle of the chart
          xAxisLabel=undefined,     // The label for the x axis
          yAxisLabel=undefined,     // The label for the y axis
          domain=undefined,
          styleOverrides=undefined, // A PlotOptions.style object with any styling overrides for the chart
          width=undefined,
          height=undefined,
          strokeWidth=2,
          marginTop=10
  } = $props()


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet("482-results-kieran.xlsx"), "", 0)

    plot = Plot.plot({
      width:width,
      height:height,
      marginTop:marginTop,  
      marginBottom:40,    
      x:{
        label:xAxisLabel, 
        domain:[1,3],
        ticks:2,
        type:"linear"
        
      },
      y:{label:yAxisLabel, domain:domain},
      marks: [
        Plot.line(data, {x: "batch", y: yAxisDataField,z:"userID" , stroke:"userID", strokeWidth:strokeWidth}),
        Plot.dot(data, {x: "batch", y: yAxisDataField, stroke:"userID", tip:true, title: d => `${d.userID} (Batch ${d.batch}): Average Difference: ${d[yAxisDataField].toFixed(2)} ${yAxisDataField==="cals_diff"?"cals":"g"}`,}),
      ],
      color:{
        scheme:"Tableau10",
        legend:true,
      },
      style: styleOverrides,
    })
    initialized = true

  })
</script>

{#if initialized}
<ObservableChart {plot} {title} {subtitle} />
{:else}
<div class={`skeleton w-${width?`[${width}px]`:"[500px]"} h-${height?`[${height}px]`:"[500px]"} ` }
  style="min-height:400px"
></div>
<div>...loading</div>
{/if}
