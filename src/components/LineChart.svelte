<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import ObservableChart from "./ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../scripts/utilities"

  let plot:string|SVGSVGElement | HTMLElement = $state(`<div></div>`)
  let initialized = $state(false)

  const {
          filename,                 // The name of the file to load
          xAxisDataField,           // The field to use for the data for the x axis
          yAxisDataField,           // The field to use for the data for the y axis
          
          // Optional Fields
          title="",                 // The title of the chart
          subtitle="",              // The subtitle of the chart
          sheetIndex=0,             // The index of the sheet, specify if you don't know the names ahead of time 
          sheetName="",             // The name of the sheet to use (or use sheetIndex if you don't know it ahead of time)
          xAxisLabel=undefined,     // The label for the x axis
          xFormat = undefined,      // Transformer format for custom x axis labels, for example a list with ["A","B","C"] and values [0,1,2] would give you labels A, B, C
          yAxisLabel=undefined,     // The label for the y axis
          colorconfig=undefined,    // The color configuration (PlotOptions.color) SEE https://observablehq.com/@observablehq/plot-cheatsheets-colors
          lineColor="blue",         // The color of the line
          domain=undefined,         // The domain of the x axis (what values to include, i.e. [0, 100] for 0-100)
          range=undefined,          // The range of the y axis (what values to include, i.e. [0, 100] for 0-100)
          styleOverrides=undefined, // A PlotOptions.style object with any styling overrides for the chart
          width=undefined,
          height=undefined
  } = $props()


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet(filename), sheetName, sheetIndex)

    plot = Plot.plot({
      width:width,
      height:height,
      marginTop:20,      
      y:{label:yAxisLabel},
      marks: [
        Plot.line(data, {x: xAxisDataField, y: yAxisDataField, stroke:lineColor, strokeWidth:5}),
        range ? Plot.ruleY(range):Plot.ruleY([0]),
        domain ? Plot.ruleX(domain): Plot.ruleX([0]),
        Plot.axisX({
          label:xAxisLabel,
          tickFormat:xFormat?Array.isArray(xFormat)
          ? (d => xFormat[d] ?? d) 
          : xFormat:undefined,
          lineWidth:8,
          marginBottom:60,
        })
      ],
      color:colorconfig,
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
