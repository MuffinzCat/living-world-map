const flyout = document.querySelector("#json-flyout");
const openButton = document.querySelector("#open-json");
const closeButton = document.querySelector("#close-json");
const applyButton = document.querySelector("#apply-json");
const map = document.querySelector("#map");
const mapFrame = document.querySelector(".map-frame");

function openFlyout() {
  flyout.showModal();
  document.querySelector("#world-data").focus();
}

function closeFlyout() {
  flyout.close();
  openButton.focus();
}

function updateMapAspectRatio() {
  const values = map.getAttribute("viewBox")?.split(/\s+/).map(Number);
  if (!values || values.length !== 4 || !values[2] || !values[3]) return;
  mapFrame.style.setProperty("--map-aspect", `${values[2]} / ${values[3]}`);
}

openButton.addEventListener("click", openFlyout);
closeButton.addEventListener("click", closeFlyout);
applyButton.addEventListener("click", () => {
  updateMapAspectRatio();
  closeFlyout();
});
flyout.addEventListener("click", event => {
  if (event.target === flyout) closeFlyout();
});

new MutationObserver(updateMapAspectRatio).observe(map, { attributes: true, attributeFilter: ["viewBox"] });
updateMapAspectRatio();
