import assert from "node:assert/strict";
import test from "node:test";
import { createHistory } from "../src/history.js";

test("undo and redo restore complete states", () => {
  const history = createHistory("one", 10);
  history.commit("two");
  history.commit("three");
  assert.equal(history.undo(), "two");
  assert.equal(history.undo(), "one");
  assert.equal(history.redo(), "two");
});

test("a new edit after undo clears redo", () => {
  const history = createHistory("one", 10);
  history.commit("two");
  history.undo();
  history.commit("different");
  assert.equal(history.canRedo, false);
});

test("identical states do not create history entries", () => {
  const history = createHistory("same", 10);
  assert.equal(history.commit("same"), false);
  assert.equal(history.canUndo, false);
});

test("history limit trims oldest entries immediately", () => {
  const history = createHistory("one", 4);
  history.commit("two");
  history.commit("three");
  history.commit("four");
  history.setLimit(2);
  assert.equal(history.undo(), "three");
  assert.equal(history.undo(), "two");
  assert.equal(history.undo(), null);
});

test("history limits are clamped to safe values", () => {
  assert.equal(createHistory("state", 0).limit, 1);
  assert.equal(createHistory("state", 9999).limit, 500);
  assert.equal(createHistory("state", "invalid").limit, 50);
});
