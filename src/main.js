import { renderBrushPreview, renderWorld } from "./map-renderer.js";
import { loadWorld, serialiseWorld } from "./world-data.js";

const SVG_NS = "http://<scrubbed-url-domain>/2000/svg";
const map = document.querySelector("#map");
const dataOutput = document.querySelector("#world-data");
const status = document.querySelector("#status");
const brushModeButton = document.querySelector("#brush-mode");
const brushType = document.querySelector("#brush-type");
const brushSize = document.querySelector("#brush-size");
const brushSizeValue = document.querySelector("#brush-size-value");

let world;
let brushMode = false;
let activeStroke = null;
let activePointerId = null;
let liveLayer;
let brushOutline;

function mapPoint(event) {
  const point = map.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const transformed = point.matrixTransform(map.getScreenCTM().inverse());
  return [Math.round(transformed.x * 10) / 10, Math.round(transformed.y * 10) / 10];
}

function pointInside([x, y]) {
  return x >= 0 && y >= 0 && x <= world.canvas.width && y <= world.canvas.height;
}

function makeInteractionLayer() {
  liveLayer = document.createElementNS(SVG_NS, "g");
  liveLayer.setAttribute("class", "live-brush-layer");
  brushOutline = document.createElementNS(SVG_NS, "circle");
  brushOutline.setAttribute("class", "brush-outline");
  brushOutline.setAttribute("visibility", "hidden");
  map.append(liveLayer, brushOutline);
}

function refreshMap() {
  renderWorld(map, world);
  makeInteractionLayer();
  dataOutput.value = serialiseWorld(world);
}

function updateOutline(point) {
  if (!brushMode || !pointInside(point)) {
    brushOutline.setAttribute("visibility", "hidden");
    return;
  }
  brushOutline.setAttribute("cx", point[0]);
  brushOutline.setAttribute("cy", point[1]);
  brushOutline.setAttribute("r", Number(brushSize.value) / 2);
  brushOutline.setAttribute("visibility", "visible");
}

function setBrushMode(enabled) {
  brushMode = enabled;
  map.classList.toggle("brush-active", enabled);
  brushModeButton.setAttribute("aria-pressed", String(enabled));
  if (!enabled) brushOutline.setAttribute("visibility", "hidden");
  status.textContent = enabled
    ? "Brush mode: drag on the map to paint. The outline shows the selected size."
    : "Brush mode off. The rendered world remains unchanged.";
}

function updateBrushSize() {
  brushSizeValue.value = brushSize.value;
  brushSizeValue.textContent = brushSize.value;
  brushOutline.setAttribute("r", Number(brushSize.value) / 2);
}

brushModeButton.addEventListener("click", () => setBrushMode(!brushMode));
brushSize.addEventListener("input", updateBrushSize);
map.addEventListener("pointerenter", event => updateOutline(mapPoint(event)));
map.addEventListener("pointerleave", () => {
  if (activePointerId === null) brushOutline.setAttribute("visibility", "hidden");
});
map.addEventListener("pointermove", event => {
  const point = mapPoint(event);
  updateOutline(point);
  if (event.pointerId !== activePointerId || !activeStroke || !pointInside(point)) return;
  const last = activeStroke.points.at(-1);
  if (Math.hypot(point[0] - last[0], point[1] - last[1]) < 2) return;
  activeStroke.points.push(point);
  renderBrushPreview(liveLayer, activeStroke);
});
map.addEventListener("pointerdown", event => {
  if (!brushMode || event.button !== 0 || activePointerId !== null) return;
  const point = mapPoint(event);
  if (!pointInside(point)) return;
  activeStroke = { type: brushType.value, size: Number(brushSize.value), points: [point] };
  world.brushStrokes.push(activeStroke);
  activePointerId = event.pointerId;
  map.setPointerCapture(event.pointerId);
  renderBrushPreview(liveLayer, activeStroke);
  event.preventDefault();
});

function finishStroke(event) {
  if (event.pointerId !== activePointerId) return;
  activePointerId = null;
  activeStroke = null;
  refreshMap();
  status.textContent = "Brush stroke added to the world data.";
}

map.addEventListener("pointerup", finishStroke);
map.addEventListener("pointercancel", finishStroke);

try {
  world = await loadWorld("data/sample-world.json");
  refreshMap();
  updateBrushSize();
  status.textContent = "Sample world rendered from canonical JSON.";
} catch (error) {
  console.error(error);
  status.textContent = `Could not load the sample world: ${error.message}`;
}
