// Direct-use figures use commonly published fixture/appliance averages (liters).
// Dietary "virtual water" figures are rough per-day averages in the range widely
// reported by water-footprint research (Hoekstra & Mekonnen) for different diet
// patterns. All figures are order-of-magnitude estimates, not a precise audit.
const LITERS_PER_GALLON = 3.78541;

const form = document.getElementById("calculator");
const results = document.getElementById("results");
const directValueEl = document.getElementById("directValue");
const dietValueEl = document.getElementById("dietValue");
const totalValueEl = document.getElementById("totalValue");
const totalGallonsEl = document.getElementById("totalGallons");
const breakdownEl = document.getElementById("breakdown");
const messageEl = document.getElementById("message");

function numberFromField(name) {
  const el = form.elements[name];
  const value = parseFloat(el.value);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function calculate() {
  const household = Math.max(1, numberFromField("household"));

  const showerLiters =
    (numberFromField("showerMinutes") * numberFromField("showersPerWeek") * 9) / 7;
  const bathLiters = (numberFromField("bathsPerWeek") * 150) / 7;
  const toiletLiters =
    parseFloat(form.elements.toilet.value) * numberFromField("flushesPerDay");
  const laundryLiters = (numberFromField("laundryLoads") * 65) / 7 / household;
  const dishLiters =
    (parseFloat(form.elements.dishwashing.value) * numberFromField("dishSessions")) /
    7 /
    household;

  const breakdown = [
    { label: "Showers", liters: showerLiters },
    { label: "Baths", liters: bathLiters },
    { label: "Toilet", liters: toiletLiters },
    { label: "Laundry (your share)", liters: laundryLiters },
    { label: "Dishwashing (your share)", liters: dishLiters },
  ];

  const directTotal = breakdown.reduce((sum, item) => sum + item.liters, 0);
  const dietLiters = parseFloat(form.elements.diet.value);
  const total = directTotal + dietLiters;

  return { directTotal, dietLiters, total, breakdown };
}

function messageFor(total) {
  // ~3,800 L/day is a commonly cited rough global average total water footprint per person.
  const globalAverage = 3800;
  if (total <= globalAverage * 0.7) {
    return "Your footprint is well below the rough global average — diet is usually the biggest lever if you want to go further.";
  }
  if (total <= globalAverage * 1.15) {
    return "You're close to the rough global average. Diet choices tend to move this number far more than shower length ever will.";
  }
  return "You're above the rough global average, largely driven by diet in most cases. See the breakdown below for direct-use savings too.";
}

function render({ directTotal, dietLiters, total, breakdown }) {
  results.hidden = false;

  directValueEl.textContent = Math.round(directTotal).toLocaleString();
  dietValueEl.textContent = Math.round(dietLiters).toLocaleString();
  totalValueEl.textContent = Math.round(total).toLocaleString();
  totalGallonsEl.textContent = Math.round(total / LITERS_PER_GALLON).toLocaleString();

  breakdownEl.innerHTML = "";
  breakdown
    .slice()
    .sort((a, b) => b.liters - a.liters)
    .forEach((item) => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = item.label;
      const value = document.createElement("span");
      value.textContent = `${Math.round(item.liters).toLocaleString()} L`;
      li.append(name, value);
      breakdownEl.append(li);
    });

  messageEl.textContent = messageFor(total);

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render(calculate());
});

form.addEventListener("reset", () => {
  results.hidden = true;
});
