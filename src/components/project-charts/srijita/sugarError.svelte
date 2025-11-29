<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import * as d3 from "d3"
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let plot = $state(`<div></div>`)
  let initialized = $state(false)

  const {
        
          subtitle="",              // The subtitle of the chart
          width=undefined,
          height=undefined,
  } = $props()
  const title="Average Error by Consumption Frequency (Sugar)"


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet("482-results-kieran.xlsx"), "", 3)
    // Filter to only Guess rows and remove duplicates
    const guesses= data.filter(d => d['Guess or actual'] === 'Guess')
        
    // Remove duplicates by food item + user ID + batch
    const seen = new Set();
  const cleanData = Array.from(
    
    guesses.filter(d => {
      const key = `${d['food item']}_${d['User ID']}_${d.Batch}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return d['frequency (select)'] !== null && d['frequency (select)'] !== '';
    })
  )
  const freqOrder = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Less Than Yearly', 'Never']
  
  const avgByFreq = d3.rollup(
  cleanData,
  v => ({
    calories: d3.mean(v, d => d.CaloriesError),
    sugar: d3.mean(v, d => d.SugarError),
    carbs: d3.mean(v, d => d.CarbsError),
    protein: d3.mean(v, d => d.ProteinError),
    fats: d3.mean(v, d => d.FatsError)
  }),
  d => d['frequency (select)']
)
  


  // Plot cell here
  const callData = [];
  avgByFreq.forEach((values, freq) => {
    callData.push({ frequency: freq, error: values.sugar });
  });

  const maxError = Math.max(...callData.map(d => d.error));

  plot= Plot.plot({
    width: 700,
    height: 500,
    marginLeft: 50,
    marginBottom: 130,
    marginTop: 50,
    style:{fontSize:14},
    x: { domain: freqOrder, label: "Consumption Frequency →", tickRotate: -45 },
    y: { label: "↑ Average Absolute Error", grid: true },
    marks: [
      Plot.barY(callData, { x: "frequency", y: "error", fill: d => d.error === maxError ? "#ff7f0e" : "#fcca9e", tip: true }),
      Plot.ruleY([0])
    ]
  });



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
