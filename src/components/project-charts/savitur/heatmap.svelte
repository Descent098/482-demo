<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import * as d3 from "d3"
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let plot = $state(`<div></div>`)
  let initialized = $state(false)

  const {
        
          // Optional Fields
          title="",                 // The title of the chart
          subtitle="",              // The subtitle of the chart
          width=undefined,
          height=undefined,
  } = $props()


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet("482-results-kieran.xlsx"), "", 1)

    // GET FOOD ITEMS
  const grouped = d3.group(data, d => d["food item"]);

  const flat = [];

  for (const [foodItem, rows] of grouped) {
    // ACTUAL ROW FOR FOOD ITEM
    const actual = rows.find(r =>
      String(r["Guess or actual"]).trim().toLowerCase() === "actual"
    );

    if (!actual) continue;

    // GUESS ROWS FOR FOOD ITEM
    const guesses = rows.filter(r =>
      String(r["Guess or actual"]).trim().toLowerCase() === "guess"
    );

    for (const guess of guesses) {
      // PERCEPTION STRING OF PERCEPTIONS
      const perceptionString = guess["Perception (select)"];
      if (!perceptionString) continue;

      const perceptions = perceptionString
        .split(",")
        .map(d => d.trim())
        .filter(Boolean);

      // ERROR CALCULATIONS (WITHOUT CALORIES)
      const sugar_error    = Math.abs(guess["Sugar(g)"]        - actual["Sugar(g)"]);
      const carbs_error    = Math.abs(guess["Carbs (g)"]       - actual["Carbs (g)"]);
      const protein_error  = Math.abs(guess["Protein (g)"]     - actual["Protein (g)"]);
      const fats_error     = Math.abs(guess["Fats (g)"]        - actual["Fats (g)"]);

      for (const p of perceptions) {
        flat.push({
          perception: p,
          sugar_error,
          carbs_error,
          protein_error,
          fats_error
        });
      }
    }
  }

  // LONG FORMAT
  const long = flat.flatMap(row => [
    { perception: row.perception, macro: "Sugar",    error: row.sugar_error },
    { perception: row.perception, macro: "Carbs",    error: row.carbs_error },
    { perception: row.perception, macro: "Protein",  error: row.protein_error },
    { perception: row.perception, macro: "Fats",     error: row.fats_error }
  ]);

  // GET AVERAGES OF VALUES
  const heatmapData = Array.from(
    d3.group(long, d => d.perception, d => d.macro),
    ([perception, macroMap]) =>
      Array.from(macroMap, ([macro, values]) => ({
        perception,
        macro,
        avg_error: d3.mean(values, v => v.error)
      }))
  ).flat();

      plot = Plot.plot({
    width: 900,
    height: 600,
    marginLeft: 150,
    marginBottom: 50,
    grid: true,
    color: { scheme: "YlOrRd", label: "Average Error (grams)", legend:true},
    x: { label: "Macro (grams)" },
    y: { label: "Perception Category" },

    marks: [
      Plot.cell(heatmapData, {
        x: "macro",
        y: "perception",
        fill: "avg_error",
        tip:true
      }),
      Plot.text(heatmapData, {
        x: "macro",
        y: "perception",
        text: d => d.avg_error.toFixed(1),
        fill: "black",
        fontSize: 11
      })
    ],
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
