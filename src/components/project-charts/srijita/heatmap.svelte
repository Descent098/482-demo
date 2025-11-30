<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import * as d3 from "d3"
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let plot = $state(`<div></div>`)
  let initialized = $state(false)


  const title="Which Macronutrients Are Hardest to Estimate?"
  const subtitle="Overall, carbohydrates are seen as the most difficult macro to estimate, specifically when it comes to food items that people consume on a weekly basis."
  const width = 1000
  const height= 400

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
  const macros = ['Sugar', 'Carbs', 'Protein', 'Fats'];
  
  const heatmapData = [];
  freqOrder.forEach(freq => {
    const freqData = cleanData.filter(d => d['frequency (select)'] === freq);
    if (freqData.length > 0) {
      heatmapData.push(
        { frequency: freq, macro: 'Sugar', error: d3.mean(freqData, d => d.SugarError), count: freqData.length },
        { frequency: freq, macro: 'Carbs', error: d3.mean(freqData, d => d.CarbsError), count: freqData.length },
        { frequency: freq, macro: 'Protein', error: d3.mean(freqData, d => d.ProteinError), count: freqData.length },
        { frequency: freq, macro: 'Fats', error: d3.mean(freqData, d => d.FatsError), count: freqData.length }
      );
    }
  });
  
  plot = Plot.plot({
    width: 1000,
    height: 400,
    marginLeft: 100,
    marginBottom: 110,
    style: { fontSize: 14 },
    x: { 
      domain: freqOrder,
      label: "Consumption Frequency →",
      tickRotate: -45
    },
    y: { 
      domain: macros,
      label: "Macronutrient →"
    },
    color: {
      scheme: "YlOrRd",
      legend: true,
      label: "Average Error →"
    },
    marks: [
      Plot.cell(heatmapData, {
        x: "frequency",
        y: "macro",
        fill: "error",
        tip: true,
        inset: 0.5,
        title: d => `${d.macro} × ${d.frequency}\nAvg Error: ${d.error.toFixed(1)}\nN = ${d.count}`
      }),
      Plot.text(heatmapData, {
        x: "frequency",
        y: "macro",
        text: d => d.error.toFixed(1),
        fill: d => d.error > 40 ? "white" : "black",
        fontSize: 11
      })
    ]
  });



    initialized = true

  })
</script>

{#if initialized}
<ObservableChart {plot} {title} {subtitle} center={true}/>
{:else}
<div class={`skeleton w-${width?`[${width}px]`:"[500px]"} h-${height?`[${height}px]`:"[500px]"} ` }
  style="min-height:400px"
></div>
<div>...loading</div>
{/if}
