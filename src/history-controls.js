import { createHistory } from "./history.js";

const limitStorageKey = "living-world-map-history-limit";
const dataOutput = document.querySelector("#world-data");
const map = document.querySelector("#map");
const applyButton = document.querySelector("#apply-json");
const undoButton = document.querySelector("#undo");
const redoButton = document.querySelector("#redo");
const limitInput = document.querySelector("#history-limit");
const status = document.querySelector("#status");
let history;
let stateBeforeAction = null;
let restoring = false;

function currentState() { return dataOutput.value; }
function updateControls() {
  if (!history) return;
  undoButton.disabled = !history.canUndo;
  redoButton.disabled = !history.canRedo;
  limitInput.value = String(history.limit);
}
function beginAction() {
  if (!history || restoring || stateBeforeAction !== null) return;
  stateBeforeAction = currentState();
}
function finishAction() {
  if (!history || restoring || stateBeforeAction === null) return;
  const before = stateBeforeAction;
  stateBeforeAction = null;
  if (before !== currentState()) history.commit(currentState());
  updateControls();
}
function restore(state, message) {
  if (state === null) return;
  restoring = true;
  dataOutput.value = state;
  applyButton.click();
  restoring = false;
  status.textContent = message;
  updateControls();
}
function initialise() {
  const storedLimit = localStorage.getItem(limitStorageKey) ?? "50";
  history = createHistory(currentState(), storedLimit);
  updateControls();
}

map.addEventListener("pointerdown", beginAction, true);
map.addEventListener("pointerup", () => setTimeout(finishAction));
map.addEventListener("pointercancel", () => setTimeout(finishAction));
applyButton.addEventListener("click", () => { beginAction(); setTimeout(finishAction); }, true);
document.querySelector("#load").addEventListener("click", () => { beginAction(); setTimeout(finishAction); }, true);
undoButton.addEventListener("click", () => restore(history.undo(), "Undid last edit."));
redoButton.addEventListener("click", () => restore(history.redo(), "Redid last edit."));
limitInput.addEventListener("change", () => {
  const limit = history.setLimit(limitInput.value);
  localStorage.setItem(limitStorageKey, String(limit));
  updateControls();
  status.textContent = `Undo history limited to ${limit} steps.`;
});
document.addEventListener("keydown", event => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "z" && event.shiftKey) { event.preventDefault(); restore(history.redo(), "Redid last edit."); }
  else if (key === "z") { event.preventDefault(); restore(history.undo(), "Undid last edit."); }
  else if (key === "y") { event.preventDefault(); restore(history.redo(), "Redid last edit."); }
});

const ready = setInterval(() => {
  if (!currentState()) return;
  clearInterval(ready);
  initialise();
}, 10);
