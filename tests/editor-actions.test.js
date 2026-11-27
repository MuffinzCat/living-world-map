import assert from "node:assert/strict";
import test from "node:test";
import {
  addRoad,
  addRoadPoint,
  deleteObjects,
  duplicateObjects,
  editSettlement,
  moveRoadPoint,
  removeRoadPoint,
} from "../src/editor-actions.js";

function world() {
  return {
    settlements: [
      { id: "oak", name: "Oak", type: "town", x: 100, y: 100 },
      { id: "ford", name: "Ford", type: "village", x: 300, y: 200 },
    ],
    mountains: [{ id: "mountain-1", x: 40, y: 50 }],
    forests: [{ id: "forest-1", x: 60, y: 70 }],
    roads: [],
  };
}

test("settlement edits preserve identity and reject invalid values", () => {
  const map = world();
  editSettlement(map, "oak", "  Green Oak  ", "castle");
  assert.deepEqual(map.settlements[0], { id: "oak", name: "Green Oak", type: "castle", x: 100, y: 100 });
  assert.throws(() => editSettlement(map, "oak", " ", "town"), /cannot be empty/);
  assert.throws(() => editSettlement(map, "oak", "Oak", "unknown"), /valid settlement type/);
});

test("mixed duplication creates one corresponding copy per object with one offset", () => {
  const map = world();
  const copies = duplicateObjects(map, [
    { kind: "settlement", id: "oak" },
    { kind: "mountain", id: "mountain-1" },
    { kind: "forest", id: "forest-1" },
  ], [20, 20]);
  assert.equal(copies.length, 3);
  assert.deepEqual(
    [map.settlements.at(-1), map.mountains.at(-1), map.forests.at(-1)].map(item => [item.x, item.y]),
    [[120, 120], [60, 70], [80, 90]],
  );
  assert.equal(new Set(map.settlements.map(item => item.id)).size, 3);
});

test("deletion removes settlements and every connected road", () => {
  const map = world();
  map.roads = [{ id: "road-1", from: "oak", to: "ford", points: [] }];
  deleteObjects(map, [{ kind: "settlement", id: "oak" }]);
  assert.equal(map.settlements.length, 1);
  assert.equal(map.roads.length, 0);
});

test("road creation rejects self, missing, and duplicate connections", () => {
  const map = world();
  addRoad(map, "oak", "ford");
  assert.throws(() => addRoad(map, "oak", "oak"), /itself/);
  assert.throws(() => addRoad(map, "oak", "missing"), /existing settlements/);
  assert.throws(() => addRoad(map, "ford", "oak"), /already connects/);
});

test("road bend points can be added, moved, and removed", () => {
  const map = world();
  const roadId = addRoad(map, "oak", "ford");
  const index = addRoadPoint(map, roadId, [180, 150]);
  moveRoadPoint(map, roadId, index, [200, 160]);
  assert.deepEqual(map.roads[0].points, [[200, 160]]);
  removeRoadPoint(map, roadId, index);
  assert.deepEqual(map.roads[0].points, []);
});
