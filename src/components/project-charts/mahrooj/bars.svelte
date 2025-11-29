<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let plot = $state(`<div></div>`)
  let initialized = $state(false)
  const  title = "Influence of Frequency of Consumption on Perceived Nutritional Value"
  const subtitle= "Guesses of macronutrients in foods consumed daily show a distinct 'healthier' profile: higher protein on average with lower fats, sugars, and carbs - compared to guesses of macronutrients in foods consumed less frequently. This suggests that people tend to perceive the foods they eat regularly as having healthier macronutrient proportions compared to foods eaten less often."



  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet("482-results-kieran.xlsx"), "", 2)
    const daily_carb_bar = data.filter(d => 
        d["Row Labels"] === "Daily" && d["Macro"] === "Average Guess of Carbs (g)"
    );
    const daily_fat_bar = data.filter(d => 
        d["Row Labels"] === "Daily" && d["Macro"] === "Average Guess of Fats (g)"
    );
    const daily_protein_bar = data.filter(d => 
        d["Row Labels"] === "Daily" && d["Macro"] === "Average Guess of Protein (g)"
    );
    const daily_sugar_bar = data.filter(d => 
        d["Row Labels"] === "Daily" && d["Macro"] === "Average Guess of Sugar(g)"
    );


    plot=Plot.plot({
  width:800,
  marginLeft: 60,
  marginBottom: 60, 
  color: { legend: true, scheme:"Pastel2", },
  x: { 
   axis: null // 
  },

  fx: { 
    domain: new Set(data.map(d => d["Row Labels"])) 
  },

  x: { axis: null }, 
  fx: { 
    label: "Macronutrient Breakdown of Foods across different Frequency of Consumptions", 
    domain: new Set(data.map(d => d["Row Labels"])) 
  },
  
  marks: [
    Plot.barY(data, {
      fx: "Row Labels",  
      x: "Macro",       
      y: "Grams",        
      fill: "Macro",     // Color
      tip: true
    }),


    // custom coloring of the daily macros in darker shades:

    Plot.barY(daily_sugar_bar, {
      fx: "Row Labels",
      x: "Macro",
      y: "Grams",
      fill: "#f781bf", 
      tip: true,
      style: { stroke: "black", strokeWidth: 1 } 
    }),

    Plot.barY(daily_protein_bar, {
      fx: "Row Labels",
      x: "Macro",
      y: "Grams",
      fill: "#80b1d3", 
      tip: true,
      style: { stroke: "black", strokeWidth: 1 } 
    }),

    Plot.barY(daily_fat_bar, {
      fx: "Row Labels",
      x: "Macro",
      y: "Grams",
      fill: "#ff7f00", 
      tip: true,
      style: { stroke: "black", strokeWidth: 1 } 
    }),

    Plot.barY(daily_carb_bar, {
      fx: "Row Labels",
      x: "Macro",
      y: "Grams",
      fill: "#66c2a5", 
      tip: true,
      style: { stroke: "black", strokeWidth: 1 } 
    }),

    
    Plot.ruleY([0])
  ]
})


    initialized = true

  })
</script>

{#if initialized}
<ObservableChart {plot} {title} {subtitle} />
{:else}
<div class= "skeleton w-[500px] h-[500px]"
  style="min-height:400px"
></div>
<div>...loading</div>
{/if}
