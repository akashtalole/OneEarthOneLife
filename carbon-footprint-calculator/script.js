// Emission factors are widely-published rough averages, not precise accounting:
// - Electricity: ~0.475 kg CO2e/kWh, a commonly cited global average grid intensity (IEA-style).
// - Car fuel factors (kg CO2e/km): typical published per-km figures for an average passenger car.
// - Flights: rough per-leg averages for short-haul (<3h) and long-haul (>6h) economy flights.
// - Diet: annual footprint bands adapted from Poore & Nemecek (2018) / Our World in Data estimates.
// - Global average and 2030 target: commonly cited per-capita figures (~4.7 t and ~2.3 t CO2e/year).
const ELECTRICITY_KG_PER_KWH = 0.475;
const GLOBAL_AVERAGE_TONNES = 4.7;
const PARIS_2030_TARGET_TONNES = 2.3;

const form = document.getElementById("calculator");
const results = document.getElementById("results");
const totalValueEl = document.getElementById("totalValue");
const barYouEl = document.getElementById("barYou");
const barYouLabelEl = document.getElementById("barYouLabel");
const breakdownEl = document.getElementById("breakdown");
const messageEl = document.getElementById("message");

function numberFromField(name) {
  const el = form.elements[name];
  const value = parseFloat(el.value);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function calculate() {
  const household = Math.max(1, numberFromField("household"));

  const electricityKwhYear = numberFromField("electricity") * 12;
  const electricityTonnes = (electricityKwhYear * ELECTRICITY_KG_PER_KWH) / 1000 / household;

  const heatingTonnes = parseFloat(form.elements.heating.value) / household;

  const carKgPerKm = parseFloat(form.elements.carType.value);
  const carKmYear = numberFromField("carDistance") * 52;
  const carTonnes = (carKmYear * carKgPerKm) / 1000 / household;

  const shortFlightTonnes = numberFromField("shortFlights") * 0.15;
  const longFlightTonnes = numberFromField("longFlights") * 0.9;
  const flightTonnes = shortFlightTonnes + longFlightTonnes;

  const dietTonnes = parseFloat(form.elements.diet.value);
  const consumptionTonnes = parseFloat(form.elements.consumption.value);

  const breakdown = [
    { label: "Home electricity", tonnes: electricityTonnes },
    { label: "Home heating", tonnes: heatingTonnes },
    { label: "Car travel", tonnes: carTonnes },
    { label: "Flights", tonnes: flightTonnes },
    { label: "Diet", tonnes: dietTonnes },
    { label: "Goods & consumption", tonnes: consumptionTonnes },
  ];

  const total = breakdown.reduce((sum, item) => sum + item.tonnes, 0);

  return { total, breakdown };
}

function messageFor(total) {
  if (total <= PARIS_2030_TARGET_TONNES) {
    return "You're already at or below the 2030 Paris-aligned per-person target. Great work — see Get Involved for ways to help others get there too.";
  }
  if (total <= GLOBAL_AVERAGE_TONNES) {
    return "You're below the global average, but still above the 2030 target. Small cuts to flights, car travel, or heating go a long way.";
  }
  return "You're above the global average. The biggest levers are usually flights, car travel, and home heating — check the breakdown below for where to start.";
}

function render({ total, breakdown }) {
  results.hidden = false;

  totalValueEl.textContent = total.toFixed(1);

  const barPercent = Math.min(100, (total / GLOBAL_AVERAGE_TONNES) * 100);
  barYouEl.style.width = `${barPercent}%`;
  barYouLabelEl.textContent = `${total.toFixed(1)} t`;

  breakdownEl.innerHTML = "";
  breakdown
    .slice()
    .sort((a, b) => b.tonnes - a.tonnes)
    .forEach((item) => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = item.label;
      const value = document.createElement("span");
      value.textContent = `${item.tonnes.toFixed(2)} t`;
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
