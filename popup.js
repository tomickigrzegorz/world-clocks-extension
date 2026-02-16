import { COUNTRIES } from "./countries.js";

const MAX_CLOCKS = 3;
let activeClocks = [];
let updateInterval;
let use24HourFormat = true; // Default to 24-hour format

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  populateCountrySelect();
  loadClocks();
  loadTimeFormat();
  setupEventListeners();
  startClockUpdates();
});

// Populate the country select
function populateCountrySelect() {
  const select = document.getElementById("country-select");
  // Build a sorted view of countries (by name) but keep original indices
  const entries = getSortedCountryEntries();
  entries.forEach(({ index, country }) => {
    if (!country.fixed) {
      const option = document.createElement("option");
      // Use original index as the value so saved indices remain valid
      option.value = index;
      option.textContent = country.name;
      select.appendChild(option);
    }
  });
}

// Return countries entries sorted by name but keep original indices
function getSortedCountryEntries() {
  return COUNTRIES.map((c, i) => ({ index: i, country: c })).sort((a, b) =>
    a.country.name.localeCompare(b.country.name),
  );
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("add-clock-btn").addEventListener("click", addClock);
  document
    .getElementById("time-format-toggle")
    .addEventListener("change", handleTimeFormatChange);
}

// Load clocks from localStorage
function loadClocks() {
  const saved = localStorage.getItem("worldClocks");
  if (saved) {
    activeClocks = JSON.parse(saved);
  } else {
    // Default clocks: Poland
    activeClocks = [
      { countryIndex: 0 }, // Poland
    ];
  }
  renderClocks();
}

// Load time format from localStorage
function loadTimeFormat() {
  const saved = localStorage.getItem("timeFormat");
  if (saved !== null) {
    use24HourFormat = saved === "24";
  }
  // Update checkbox state (checked = 24h)
  document.getElementById("time-format-toggle").checked = use24HourFormat;
}

// Handle time format change
function handleTimeFormatChange(event) {
  use24HourFormat = event.target.checked;
  localStorage.setItem("timeFormat", use24HourFormat ? "24" : "12");
  updateClocks(); // Refresh all clocks immediately
}

// Save clocks to localStorage
function saveClocks() {
  localStorage.setItem("worldClocks", JSON.stringify(activeClocks));
}

// Render all clocks
function renderClocks() {
  const container = document.getElementById("clocks-container");
  container.innerHTML = "";

  activeClocks.forEach((clock, index) => {
    const country = COUNTRIES[clock.countryIndex];
    const clockElement = createClockElement(country, index);
    container.appendChild(clockElement);
  });

  updateAddButtonState();
}

// Create clock element
function createClockElement(country, index) {
  const section = document.createElement("div");
  section.className = "clock-section";
  if (country.fixed) {
    section.classList.add("poland");
  }
  section.dataset.index = index;

  const clockId = `clock-${index}`;

  section.innerHTML = `
    ${
      !country.fixed
        ? `<button class="remove-btn" data-index="${index}">×</button>`
        : ""
    }
    <div class="clock">
      <div class="city">${country.name}</div>
      <div class="time" id="${clockId}-time">--:--:--</div>
      <div class="date" id="${clockId}-date">--</div>
    </div>
    <div class="analog-clock" id="${clockId}-analog">
      <div class="hour-hand hand" id="${clockId}-hour"></div>
      <div class="minute-hand hand" id="${clockId}-minute"></div>
      <div class="second-hand hand" id="${clockId}-second"></div>
      <div class="center-circle"></div>
    </div>
  `;

  // Add event listener to remove button
  if (!country.fixed) {
    const removeBtn = section.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => removeClock(index));
  }

  // Dodanie znaków godzinowych po dodaniu do DOM
  setTimeout(() => {
    createHourMarks(`${clockId}-analog`);
  }, 0);

  return section;
}

// Create hour marks for analog clocks
function createHourMarks(clockId) {
  const clock = document.getElementById(clockId);
  if (!clock) return;

  for (let i = 1; i <= 12; i++) {
    // Linie znaków godzinowych
    const mark = document.createElement("div");
    mark.className = "hour-mark";
    mark.style.transform = `rotate(${i * 30}deg)`;
    clock.appendChild(mark);

    // Cyfry godzinowe
    const number = document.createElement("div");
    number.className = "hour-number";
    number.textContent = i;
    number.style.transform = `rotate(${i * 30}deg) translateY(-38px) rotate(${
      -i * 30
    }deg)`;
    clock.appendChild(number);
  }
}

// Add a new clock
function addClock() {
  if (activeClocks.length >= MAX_CLOCKS) {
    alert("You can have up to 3 clocks only!");
    return;
  }

  const select = document.getElementById("country-select");
  const selectedIndex = parseInt(select.value);

  if (isNaN(selectedIndex)) {
    alert("Select a country from the list!");
    return;
  }

  // Sprawdź czy kraj już istnieje
  if (activeClocks.some((clock) => clock.countryIndex === selectedIndex)) {
    alert("This country is already added!");
    return;
  }

  activeClocks.push({ countryIndex: selectedIndex });
  saveClocks();
  renderClocks();
  select.value = "";
}

// Remove a clock
function removeClock(index) {
  const country = COUNTRIES[activeClocks[index].countryIndex];
  if (country.fixed) {
    return; // Poland cannot be removed
  }

  activeClocks.splice(index, 1);
  saveClocks();
  renderClocks();
}

// Update add button state
function updateAddButtonState() {
  const btn = document.getElementById("add-clock-btn");
  btn.disabled = activeClocks.length >= MAX_CLOCKS;
}

// Update all clocks
function updateClocks() {
  const now = new Date();

  activeClocks.forEach((clock, index) => {
    const country = COUNTRIES[clock.countryIndex];
    const clockId = `clock-${index}`;

    updateDigitalClock(clockId, now, country);
    updateAnalogClock(clockId, now, country.timezone);
  });
}

// Update digital clock
function updateDigitalClock(clockId, date, country) {
  const timeElement = document.getElementById(`${clockId}-time`);
  const dateElement = document.getElementById(`${clockId}-date`);

  if (!timeElement || !dateElement) return;
  // Use English locale for display (Latin numerals and English weekday/month)
  // but keep the country's timezone so the local time is correct.
  const displayLocale = "en-GB";
  const time = date.toLocaleString(displayLocale, {
    timeZone: country.timezone,
    hour12: !use24HourFormat,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateStr = date.toLocaleDateString(displayLocale, {
    timeZone: country.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  timeElement.textContent = time;
  dateElement.textContent = dateStr;
}

// Update analog clock
function updateAnalogClock(clockId, date, timeZone) {
  const hourHand = document.getElementById(`${clockId}-hour`);
  const minuteHand = document.getElementById(`${clockId}-minute`);
  const secondHand = document.getElementById(`${clockId}-second`);

  if (!hourHand || !minuteHand || !secondHand) return;

  const hours = date.toLocaleString("en-US", {
    timeZone: timeZone,
    hour12: false,
    hour: "numeric",
  });
  const minutes = date.toLocaleString("en-US", {
    timeZone: timeZone,
    minute: "numeric",
  });
  const seconds = date.toLocaleString("en-US", {
    timeZone: timeZone,
    second: "numeric",
  });

  const hour = parseInt(hours) % 12;
  const minute = parseInt(minutes);
  const second = parseInt(seconds);

  const hourAngle = hour * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const secondAngle = second * 6;

  hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
}

// Start updating clocks
function startClockUpdates() {
  updateClocks();
  updateInterval = setInterval(updateClocks, 100);
}
