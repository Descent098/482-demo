<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import * as d3 from "d3"
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let plot = $state(`<div></div>`)
  let initialized = $state(false)

  const {
          width=undefined,
          height=undefined,
  } = $props()
  const title="How Does Consumption Frequency Affect Estimation Accuracy?"
  const subtitle="Average absolute error decreases with familiarity, suggesting that the frequent consumption of an item improves nutritional awareness"


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
  
  // Flatten for plotting
  const chartData = [];
  avgByFreq.forEach((values, freq) => {
    chartData.push(
      { frequency: freq, macro: 'Calories', error: values.calories },
      { frequency: freq, macro: 'Sugar', error: values.sugar },
      { frequency: freq, macro: 'Carbs', error: values.carbs },
      { frequency: freq, macro: 'Protein', error: values.protein },
      { frequency: freq, macro: 'Fats', error: values.fats }
    );
  });
  
  plot= Plot.plot({
    width: 1000,
    height: 500,
    marginLeft: 80,
    marginBottom: 100,
    marginTop: 50,
    style: { fontSize: 14 },
    x: { 
      domain: freqOrder,
      label: "Consumption Frequency →",
      tickRotate: -45
    },
    y: { 
      label: "↑ Average Absolute Error",
      grid: true
    },
    color: {
      label: "Macronutrient",
      legend: true,
      scheme: "tableau10"
    },
    marks: [
      Plot.barY(chartData, {
        x: "frequency",
        y: "error",
        fill: "macro",
        tip: true,
        title: d => `${d.macro}\n${d.frequency}\nAvg Error: ${d.error.toFixed(1)}`
      }),
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
