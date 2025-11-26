<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import ObservableChart from './ObservableChart.svelte';
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../scripts/utilities"

  let plot:string|SVGSVGElement | HTMLElement = $state(`<div>Loading...</div>`)
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
          yAxisLabel=undefined,     // The label for the y axis
          fillDataField=undefined,  // The field to colour the bars based on (usually y value or some sort of category)
          colorconfig=undefined,    // The color configuration (PlotOptions.color) SEE https://observablehq.com/@observablehq/plot-cheatsheets-colors
          domain=undefined,         // The domain (the range of numbers found in the y-axis)
          styleOverrides=undefined, // A PlotOptions.style object with any styling overrides for the chart
          width=undefined,
          height=undefined,
  } = $props()


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet(filename), sheetName, sheetIndex)
    
    plot = Plot.plot({
      width:width,
      height:height,
      marginTop:20,      
      x:{label:xAxisLabel},
      y:{label:yAxisLabel},
      marks: [
        Plot.barY(data, {x: xAxisDataField, y: yAxisDataField, sort: {x: "y", reverse: true,limit: 20}, fill:fillDataField}),
        domain ? Plot.ruleY(domain):Plot.ruleY([0]),
        Plot.axisX({marginBottom:40}),
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
  <div class={`skeleton w-${width?`[${width}px]`:"[800px]"} h-${height?`[${height}px]`:"[800px]"} ` }
    style="min-height:800px"
  ></div>
  <div>...loading</div>
{/if}

