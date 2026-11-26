import { loadWorld } from "./world-data.js";

const map = document.querySelector("#map");
const dataOutput = document.querySelector("#world-data");
const status = document.querySelector("#status");

function showFoundation(world) {
  map.setAttribute("viewBox", `0 0 ${world.canvas.width} ${world.canvas.height}`);
  map.replaceChildren();

  const background = document.createElementNS("http://<scrubbed-url-domain>/2000/svg", "rect");
  background.setAttribute("width", world.canvas.width);
  background.setAttribute("height", world.canvas.height);
  background.setAttribute("fill", "#a9c5c0");
  map.append(background);

  dataOutput.value = JSON.stringify(world, null, 2);
  status.textContent = "Foundation loaded. Map tools will be restored in the next slices.";
}

try {
  showFoundation(await loadWorld("data/sample-world.json"));
} catch (error) {
  console.error(error);
  status.textContent = `Could not load the sample world: ${error.message}`;
}
