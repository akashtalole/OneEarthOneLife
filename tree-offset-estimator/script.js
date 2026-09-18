// ~21 kg CO2/year for a mature tree is a widely-cited rough average; actual absorption
// varies enormously by species, age, climate, and soil. This is a scale estimate, not a
// precise offset calculation.
const MAX_TREE_ICONS = 300;

const form = document.getElementById("calculator");
const results = document.getElementById("results");
const treeCountEl = document.getElementById("treeCount");
const treeGridEl = document.getElementById("treeGrid");
const messageEl = document.getElementById("message");

function prefillFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  const tonnes = parseFloat(params.get("tonnes"));
  if (Number.isFinite(tonnes) && tonnes >= 0) {
    form.elements.tonnes.value = tonnes;
  }
}

function numberFromField(name, fallback = 0) {
  const el = form.elements[name];
  const value = parseFloat(el.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function calculate() {
  const tonnes = numberFromField("tonnes");
  const years = Math.max(1, numberFromField("years", 1));
  const kgPerTreePerYear = parseFloat(form.elements.treeType.value);

  const totalKg = tonnes * 1000 * years;
  const treesNeeded = kgPerTreePerYear > 0 ? Math.ceil(totalKg / kgPerTreePerYear) : 0;

  return { treesNeeded, years };
}

function messageFor(treesNeeded, years) {
  if (treesNeeded === 0) {
    return "Enter your footprint above to see an estimate.";
  }
  const perYear = Math.ceil(treesNeeded / years);
  if (years > 1) {
    return `That's roughly ${perYear.toLocaleString()} trees per year, kept growing for ${years} years — and remember, a newly planted tree takes years to reach the absorption rates used here.`;
  }
  return "Remember: a newly planted tree takes years to reach the absorption rate used here, so this represents trees planted and left to mature, not an instant offset.";
}

function render({ treesNeeded, years }) {
  results.hidden = false;

  treeCountEl.textContent = treesNeeded.toLocaleString();

  const iconCount = Math.min(treesNeeded, MAX_TREE_ICONS);
  const remainder = treesNeeded - iconCount;
  treeGridEl.innerHTML = "";
  treeGridEl.append("🌳".repeat(iconCount));
  if (remainder > 0) {
    const more = document.createElement("span");
    more.className = "more";
    more.textContent = `+ ${remainder.toLocaleString()} more`;
    treeGridEl.append(more);
  }

  messageEl.textContent = messageFor(treesNeeded, years);

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render(calculate());
});

form.addEventListener("reset", () => {
  results.hidden = true;
});

prefillFromQueryString();
