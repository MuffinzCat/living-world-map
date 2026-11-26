import { palette } from "./map-renderer.js";

const SVG_NS = "http://<scrubbed-url-domain>/2000/svg";

function pathData(points) {
  const drawable = points.length === 1 ? [points[0], points[0]] : points;
  return drawable.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

export function renderBrushPreview(layer, stroke) {
  layer.replaceChildren();
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("class", "live-brush-stroke");
  path.setAttribute("d", pathData(stroke.points));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", stroke.type === "mountainRange" ? palette.mountain : palette[stroke.type]);
  path.setAttribute("stroke-width", stroke.type === "mountainRange" ? Math.max(3, stroke.size * 0.18) : stroke.size);
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  if (stroke.type === "mountainRange") path.setAttribute("stroke-dasharray", "5 6");
  layer.append(path);
}
