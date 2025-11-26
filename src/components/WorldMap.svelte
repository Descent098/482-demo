<script lang="ts">
  import { onMount } from "svelte";
  import * as Plot from "@observablehq/plot";
  import * as d3 from "d3";
  import { feature } from "topojson-client";
  import ObservableChart from "./ObservableChart.svelte";
  import world110m from "../scripts/countries-110m.json";

  import {
    getDataFromSpreadsheet,
    parseDataFromWorksheet,
  } from "../scripts/utilities";

  let plot: string | SVGSVGElement | HTMLElement = $state(
    `<div>loading...</div>`,
  );
  let initialized = $state(false)

  const {
    filename, // The name of the file to load

    // Optional Fields
    title = "", // The title of the chart
    subtitle = "", // The subtitle of the chart
    sheetIndex = 0, // The index of the sheet, specify if you don't know the names ahead of time
    sheetName = "", // The name of the sheet to use (or use sheetIndex if you don't know it ahead of time)
    sizeBy = undefined, // The field to use for the size and color of the dots
    width = undefined,
    height = undefined,
    dotColors = "Greens", // The colors to use, must be one of the colorTypes below
  } = $props();

  onMount(async () => {
    const data = await parseDataFromWorksheet(
      await getDataFromSpreadsheet(filename),
      sheetName,
      sheetIndex,
    );

    const colorTypes = {
      Greens: d3.interpolateGreens,
      Purples: d3.interpolatePurples,
      Reds: d3.interpolateReds,
      Blues: d3.interpolateBlues,
      Oranges: d3.interpolateOranges,
      Greys: d3.interpolateGreys,
    };

    //@ts-ignore
    const world = feature(world110m, world110m.objects.countries);

    // Create a D3 projection
    const projection = d3.geoMercator();

    // Compute a GeoJSON FeatureCollection from your points
    const pointsGeoJSON = {
      type: "FeatureCollection",
      features: data.map((d) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          //@ts-ignore
          coordinates: [d.longitude, d.latitude],
        },
        properties: d,
      })),
    };

    // Move map to fit around location (this case greece/europe)
    projection.fitExtent(
      [
        [20, 20],
        [1250, 580],
      ],
      //@ts-ignore
      pointsGeoJSON,
    );

    // Compute min/max of the sizeBy field for color scaling
    //@ts-ignore
    const values = data.map((d) => d[sizeBy]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Create a color scale
    const colorScale = d3
      .scaleSequential(
        //@ts-ignore
        colorTypes[dotColors] ? colorTypes[dotColors] : d3.interpolateGreens,
      )
      .domain([minVal, maxVal]);

    plot = Plot.plot({
      width: width,
      height: height,
      projection,
      marks: [
        Plot.geo(world, { stroke: "#ccc", fill: "#141414" }),
        Plot.dot(data, {
          x: "longitude",
          y: "latitude",
          r: (d) => Math.sqrt(d[sizeBy]),
          fill: (d) => colorScale(d[sizeBy]),
          fillOpacity: 0.8,
          stroke: "white",
        }),
      ],
    });

    initialized = true
  });
</script>

{#if initialized}
<ObservableChart {plot} {title} {subtitle} />
{:else}
<div class={`skeleton w-${width?`[${width}px]`:"[500px]"} h-${height?`[${height}px]`:"[500px]"} ` }
  style="min-height:400px"
></div>
<div>...loading</div>
{/if}
