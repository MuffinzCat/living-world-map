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
  insertRoadPoint,
  addRiver,
  addRiverPoint,
  insertRiverPoint,
  moveRiverPoint,
  removeRiverPoint,
  riverDrawSpacing,
  extendRiverFromEnd,
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

test("generated mountain duplication detaches the copy into a manual mountain", () => {
  const map = world();
  map.mountains = [{ id: "generated-mountain", x: 40, y: 50, sourceId: "source-1", seed: 123, size: 32 }];
  const copies = duplicateObjects(map, [{ kind: "mountain", id: "generated-mountain" }], [20, 20]);
  const copy = map.mountains.find(item => item.id === copies[0].id);
  assert.equal(copy.sourceId, undefined);
  assert.equal(copy.seed, undefined);
  assert.equal(copy.suppressed, undefined);
  assert.deepEqual([copy.x, copy.y], [60, 70]);
});

test("generated forest duplication detaches the copy into a manual tree", () => {
  const map = world();
  map.forests = [{ id: "generated-forest", x: 60, y: 70, sourceId: "forest-source", seed: 123, size: 39 }];
  const copies = duplicateObjects(map, [{ kind: "forest", id: "generated-forest" }], [20, 20]);
  const copy = map.forests.find(item => item.id === copies[0].id);
  assert.equal(copy.sourceId, undefined);
  assert.equal(copy.seed, undefined);
  assert.equal(copy.suppressed, undefined);
  assert.deepEqual([copy.x, copy.y], [80, 90]);
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

test("road bend points insert at the clicked segment position", () => {
  const map = world();
  const roadId = addRoad(map, "oak", "ford");
  const index = insertRoadPoint(map, roadId, [200, 150]);
  assert.equal(index, 0);
  assert.deepEqual(map.roads[0].points, [[200, 150]]);
});

test("river creation rejects single points and duplicates positive, negative, and mixed points", () => {
  const map = world();
  map.rivers = [];
  assert.throws(() => addRiver(map, [[0, 0]]), /at least two/);
  const river = addRiver(map, [[-100, -50], [0, 20], [100, -30]]);
  assert.equal(river.id, "river-1");
  assert.deepEqual(river.points, [[-100, -50], [0, 20], [100, -30]]);
});

test("river bend points can be added, inserted, moved, and removed", () => {
  const map = world();
  map.rivers = [{ id: "river-1", points: [[0, 0], [100, 0], [200, 50]] }];
  addRiverPoint(map, "river-1", [300, 100]);
  assert.deepEqual(map.rivers[0].points.at(-1), [300, 100]);
  const inserted = insertRiverPoint(map, "river-1", [50, 25]);
  assert.equal(inserted, 1);
  moveRiverPoint(map, "river-1", inserted, [60, 30]);
  assert.deepEqual(map.rivers[0].points[inserted], [60, 30]);
  removeRiverPoint(map, "river-1", inserted);
  assert.deepEqual(map.rivers[0].points, [[0, 0], [100, 0], [200, 50], [300, 100]]);
});

test("river deletion and duplication preserve exact geometry and stable identities", () => {
  const map = world();
  map.rivers = [{ id: "river-1", points: [[-50, 10], [20, 30], [90, -40]] }];
  const copies = duplicateObjects(map, [{ kind: "river", id: "river-1" }], [20, 20]);
  assert.equal(copies[0].kind, "river");
  assert.equal(map.rivers.length, 2);
  assert.notEqual(map.rivers[1].id, "river-1");
  assert.deepEqual(map.rivers[1].points, [[-30, 30], [40, 50], [110, -20]]);
  deleteObjects(map, [{ kind: "river", id: "river-1" }]);
  assert.equal(map.rivers.length, 1);
});

test("river draw smoothing reduces draw spacing at higher settings", () => {
  assert.equal(riverDrawSpacing(0), 2);
  assert.equal(riverDrawSpacing(50), 11);
  assert.equal(riverDrawSpacing(100), 20);
  assert.ok(riverDrawSpacing(100) > riverDrawSpacing(0));
});

test("line continuation only extends from river end nodes", () => {
  const map = world();
  map.rivers = [{ id: "river-1", points: [[0, 0], [100, 0], [200, 50]] }];
  extendRiverFromEnd(map, "river-1", 2, [300, 100]);
  assert.deepEqual(map.rivers[0].points, [[0, 0], [100, 0], [200, 50], [300, 100]]);
  extendRiverFromEnd(map, "river-1", 0, [-100, -50]);
  assert.deepEqual(map.rivers[0].points, [[-100, -50], [0, 0], [100, 0], [200, 50], [300, 100]]);
  assert.throws(() => extendRiverFromEnd(map, "river-1", 2, [400, 100]), /end node/);
});
