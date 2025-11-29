<script lang="ts">
    import { onMount } from "svelte";

    let plotEl: HTMLElement;

    const {
        /**@type {string|SVGSVGElement | HTMLElement }*/
        plot = `<div></div>`,

        // Optional Fields
        title = "", // The title of the chart
        subtitle = "", // The subtitle of the chart
    } = $props();

    function updateComponent() {
        // Setup titles + subtitles
        const titleElement = document.createElement("h2");
        titleElement.classList.add("text-xl", "font-bold");
        titleElement.innerHTML = title;

        const subTitleElement = document.createElement("h4");
        subTitleElement.classList.add("text-md", "max-w-[50vw]");
        subTitleElement.innerHTML = subtitle;
        plotEl.innerHTML = ""; // Reset element state

        // Build up element peice by peice
        if (title){
            plotEl.appendChild(titleElement);
        }
        if (subtitle){
            plotEl.appendChild(subTitleElement);
        }
        if (plot.innerHTML !== undefined) {
            plotEl.appendChild(plot);
        }
    }

    $effect(updateComponent);
    onMount(updateComponent);
</script>

<div class="w-full flex flex-col gap-1" bind:this={plotEl}></div>
