<script>
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import * as d3 from "d3"
  import ObservableChart from "../../ObservableChart.svelte";
  import {getDataFromSpreadsheet, parseDataFromWorksheet} from "../../../scripts/utilities.ts"

  let initialized = $state(false)
  let caloriesPlot = $derived(renderMacroPlot("calories", "Calories (cal)"))
  let fatsPlot = $derived(renderMacroPlot("fats", "Fats (g)"))
  let carbsPlot = $derived(renderMacroPlot("carbs", "Carbs (g)"))
  let sugarsPlot = $derived(renderMacroPlot("Sugar", "Sugars (g)"))
  let proteinsPlot = $derived(renderMacroPlot("protein", "Protein (g)"))
  let allFrequenciesChecked = $state(true)
  let actual
  let guess


  const frequencies = ["Never", "Less Than Yearly", "Yearly", "Weekly", "Monthly", "Daily"]
  const selectedFreqs = $state({
                "Never": true,
                "Less Than Yearly": true,
                "Yearly": true,
                "Weekly": true,
                "Monthly": true,
                "Daily": true
            }
  )


  onMount(async ()=>{
    const data = await parseDataFromWorksheet(await getDataFromSpreadsheet("482-results-kieran.xlsx"), "", 4)

    actual = data.filter(row => row.guess_actual === "Actual")

    guess = data.filter(row => row.guess_actual === "Guess")

    initialized = true

  })


  function getCombinedData(macro){
    const avgMacroGuess = actual.map(a => {
        const foodName = a.food_item;
        const matches = guess.filter(g => g.food_item === foodName && selectedFreqs[g["frequency"]]);
        return {
        "Food Items": foodName,
        "Grams": matches.length ? d3.mean(matches, g => +g[macro]) : null,
        "_n_matches": matches.length
        };
    });

    return [
        ...actual.map(d => ({
      food: d.food_item,
      macro: +d[macro],
      type: "Actual"
    })),
    ...avgMacroGuess.filter(a => a.Grams !== null).map(d => ({
      food: d["Food Items"],
      macro: +d.Grams,
      type: "Average Guess",
      n_matches: d._n_matches
    }))
  ];
  }

  function renderMacroPlot(macro="calories", yLabel="Calories"){
    if (!initialized) return "<div>Loading</div>"

    const combined = getCombinedData(macro)

    console.log("Combined is", combined)
    return Plot.plot({
        margin: 50,
        x: {
        label: "Food item",
        ticks: [],
        tickFormat: () => ""   
        },
        y: {
        label: yLabel
        },
        marks: [
        Plot.dot(combined, {
            x: "food",
            y: "macro",
            stroke: "type",
            r: 5,
            title: d => `${d.food} (${d.type}): ${d.macro}${macro==="calories"?"cals":"g"}${d.n_matches ? ` (n=${d.n_matches})` : ""}`,
            tip:true
        })
        ],
        color: { legend: true, scheme:"Tableau10"},
        style: { fontSize: 14, marginBottom: 60 }
    });
  }


    function toggleAllSelectedFrequencies(changedByFrequency = false){
        if (changedByFrequency){
            allFrequenciesChecked = false
        }
        if (allFrequenciesChecked){
            console.log("Setting all frequencies")
            selectedFreqs["Never"] = true
            selectedFreqs["Less Than Yearly"] = true
            selectedFreqs["Yearly"] = true
            selectedFreqs["Weekly"] = true
            selectedFreqs["Monthly"] = true
            selectedFreqs["Daily"] = true
        }
    }

</script>

{#if initialized}

<fieldset class="bg-base-100 border-base-300 rounded-box w-full border p-3 
    grid gap-1 grid-cols-1 md:grid-cols-4 lg:grid-cols-7 lg:justify-items-center">
  <legend class="fieldset-legend mt-12">Frequency</legend>
  <label class="label">
    <input type="checkbox" bind:checked={allFrequenciesChecked} class="checkbox" name="all" onchange={()=>toggleAllSelectedFrequencies()}/>
    All
  </label>
  {#each frequencies as frequency}
  <label class="label">
    <input type="checkbox" bind:checked={selectedFreqs[frequency]} class="checkbox" name={frequency} onchange={()=>toggleAllSelectedFrequencies(true)}/>
    {frequency}
  </label>
  {/each}
</fieldset>

<div class="flex flex-col md:flex-row">
    <ObservableChart plot={caloriesPlot} title="Actual vs. Average Guess (Calories)"/>
    <ObservableChart plot={fatsPlot} title="Actual vs. Average Guess (Fats)" />
</div>

<div class="flex flex-col md:flex-row">
    <ObservableChart plot={carbsPlot} title="Actual vs. Average Guess (Carbohydrates)"/>
    <ObservableChart plot={sugarsPlot} title="Actual vs. Average Guess (Sugars)" />
</div>
<div class="flex justify-center align-center w-full items-center">
    <ObservableChart plot={proteinsPlot} title="Actual vs. Average Guess (Protein)" center={true}/>
</div>
{:else}
<div class="skeleton min-h-[400px] min-w-[400px]"></div>
<div>...loading</div>
{/if}
