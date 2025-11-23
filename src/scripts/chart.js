import * as Plot from "@observablehq/plot";



const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
document.getElementById("chart").innerHTML = plot.innerHTML