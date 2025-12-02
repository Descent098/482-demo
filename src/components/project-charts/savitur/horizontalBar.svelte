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

  const rows = [];

  for (const [food, items] of grouped) {
    const actual = items.find(r =>
      String(r["Guess or actual"]).trim().toLowerCase() === "actual"
    );
    if (!actual) continue;
    const guesses = items.filter(r =>
      String(r["Guess or actual"]).trim().toLowerCase() === "guess"
    );

    for (const guess of guesses) {
      const perceptionString = guess["Perception (select)"];
      if (!perceptionString) continue;

      const perceptions = perceptionString
        .split(",")
        .map(d => d.trim())
        .filter(Boolean);

      const cal_error = Math.abs(guess["Calories (cal)"] - actual["Calories (cal)"]);

      for (const p of perceptions) {
        rows.push({
          perception: p,
          cal_error
        });
      }
    }
  }

  // GET AVERAGES OF VALUES
  let avgData = Array.from(
    d3.group(rows, d => d.perception),
    ([perception, values]) => ({
      perception,
      avg_error: d3.mean(values, v => v.cal_error)
    })
  );

  // REMOVE 0 VALUES
  avgData = avgData.filter(d => d.avg_error !== 0);

  // SORT DATA FOR BAR CHART
  avgData.sort((a, b) => d3.descending(a.avg_error, b.avg_error));

  // PLOT
  plot = Plot.plot({
    width: 850,
    height: 600,
    marginLeft: 150,
    marginBottom: 50,

    x: { label: "Average Calorie Error" },
    y: { label: "Perception Category", domain: avgData.map(d => d.perception)},

    color: { scheme: "Blues" },

    marks: [
      Plot.barX(avgData, {
        y: "perception",
        x: d => d.avg_error + 5,
        fill: "avg_error",
        tip:true
      }),
      Plot.text(avgData, {
        y: "perception",
        x: "avg_error",
        text: d => d.avg_error.toFixed(1),
        dx: 5,
        dy: 3,
        fill: "black"
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
