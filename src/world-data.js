export const CURRENT_FORMAT_VERSION = 1;

export function validateWorld(world) {
  if (!world || typeof world !== "object" || Array.isArray(world)) {
    throw new TypeError("World data must be an object.");
  }
  if (world.formatVersion !== CURRENT_FORMAT_VERSION) {
    throw new Error(`Unsupported world format version: ${world.formatVersion}`);
  }
  if (!world.canvas || !Number.isFinite(world.canvas.width) || world.canvas.width <= 0 || !Number.isFinite(world.canvas.height) || world.canvas.height <= 0) {
    throw new Error("Canvas width and height must be positive numbers.");
  }
  for (const key of ["terrain", "settlements", "roads", "rivers", "forests", "mountains", "mountainRanges", "brushStrokes"]) {
    if (!Array.isArray(world[key])) throw new Error(`${key} must be an array.`);
  }
  if (typeof world.notes !== "string") throw new Error("notes must be a string.");
  return world;
}

export async function loadWorld(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load world data (${response.status}).`);
  return validateWorld(await response.json());
}
