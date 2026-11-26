import { renderWorld } from "./map-renderer.js";
import { loadWorld, serialiseWorld } from "./world-data.js";

const map = document.querySelector("#map");
const dataOutput = document.querySelector("#world-data");
const status = document.querySelector("#status");

try {
  const world = await loadWorld("data/sample-world.json");
  renderWorld(map, world);
  dataOutput.value = serialiseWorld(world);
  status.textContent = "Sample world rendered from canonical JSON.";
} catch (error) {
  console.error(error);
  status.textContent = `Could not load the sample world: ${error.message}`;
}
