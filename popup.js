import { COUNTRIES } from "./countries.js";

const MAX_CLOCKS = 3;
let activeClocks = [];
let updateInterval;
let use24HourFormat = true; // Default to 24-hour format
let showAnalogClock = true; // Default to showing analog clock
let showConverter = false;
let converterRefDate = null; // UTC reference date for converter display

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  populateCountrySelect();
  loadClocks();
  loadTimeFormat();
  loadAnalogClockSetting();
  loadConverterSetting();
  setupEventListeners();
  startClockUpdates();
});

// Populate the country select
function populateCountrySelect() {
  const select = document.getElementById("country-select");
  // Build a sorted view of countries (by name) but keep original indices
  const entries = getSortedCountryEntries();
  entries.forEach(({ index, country }) => {
    const option = document.createElement("option");
    // Use original index as the value so saved indices remain valid
    option.value = index;
    option.textContent = country.name;
    select.appendChild(option);
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
  document
    .getElementById("analog-clock-toggle")
    .addEventListener("change", handleAnalogClockToggle);
  document
    .getElementById("converter-toggle")
    .addEventListener("change", handleConverterToggle);
  document
    .getElementById("conv-time")
    .addEventListener("input", handleConverterBarChange);
  document
    .getElementById("conv-country")
    .addEventListener("change", handleConverterBarChange);
}

// Load clocks from localStorage
function loadClocks() {
  const saved = localStorage.getItem("worldClocks");
  if (saved) {
    activeClocks = JSON.parse(saved);
  } else {
    activeClocks = [];
  }
  renderClocks();
}

// Load analog clock setting from localStorage
function loadAnalogClockSetting() {
  const saved = localStorage.getItem("showAnalogClock");
  if (saved !== null) {
    showAnalogClock = saved === "true";
  }
  document.getElementById("analog-clock-toggle").checked = showAnalogClock;
  applyAnalogClockVisibility();
}

// Handle analog clock toggle
function handleAnalogClockToggle(event) {
  showAnalogClock = event.target.checked;
  localStorage.setItem("showAnalogClock", showAnalogClock);
  applyAnalogClockVisibility();
}

// Show or hide all analog clocks
function applyAnalogClockVisibility() {
  document.querySelectorAll(".analog-clock").forEach((el) => {
    el.style.display = showAnalogClock ? "" : "none";
  });
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

  applyAnalogClockVisibility();
  if (showConverter) {
    updateConvCountrySelect();
    applyConverterVisibility();
  }
  updateAddButtonState();
}

// Create clock element
function createClockElement(country, index) {
  const section = document.createElement("div");
  section.className = "clock-section";
  section.dataset.index = index;

  const clockId = `clock-${index}`;

  section.innerHTML = `
    <button class="remove-btn" data-index="${index}">×</button>
    <div class="clock" id="${clockId}-card">
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
  const removeBtn = section.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => removeClock(index));

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
  const date =
    showConverter && converterRefDate ? converterRefDate : new Date();

  activeClocks.forEach((clock, index) => {
    const country = COUNTRIES[clock.countryIndex];
    const clockId = `clock-${index}`;

    updateDigitalClock(clockId, date, country);
    updateAnalogClock(clockId, date, country.timezone);
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

// ── Time Converter ──────────────────────────────────────────────────────────

function loadConverterSetting() {
  const saved = localStorage.getItem("showConverter");
  if (saved !== null) showConverter = saved === "true";
  document.getElementById("converter-toggle").checked = showConverter;
  if (showConverter) {
    updateConvCountrySelect();
  }
  applyConverterVisibility();
}

function handleConverterToggle(event) {
  showConverter = event.target.checked;
  localStorage.setItem("showConverter", showConverter);
  if (showConverter) {
    // Pre-fill bar with current real time
    const now = new Date();
    document.getElementById("conv-time").value =
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    updateConvCountrySelect();
    handleConverterBarChange();
  } else {
    converterRefDate = null;
    updateClocks(); // return to real time
  }
  applyConverterVisibility();
}

// Show/hide the bar and apply/remove converter-mode class on cards
function applyConverterVisibility() {
  document.getElementById("converter-bar").style.display = showConverter
    ? "flex"
    : "none";
  document.querySelectorAll(".clock").forEach((el) => {
    el.classList.toggle("converter-mode", showConverter);
  });
}

// Populate the converter country dropdown from active clocks
function updateConvCountrySelect() {
  const sel = document.getElementById("conv-country");
  const prevValue = sel.value;
  sel.innerHTML = "";
  activeClocks.forEach((clock, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = COUNTRIES[clock.countryIndex].name;
    sel.appendChild(opt);
  });
  // Restore previous selection if still valid
  if (prevValue && sel.querySelector(`option[value="${prevValue}"]`)) {
    sel.value = prevValue;
  }
}

// Called when time input or country dropdown changes
function handleConverterBarChange() {
  const timeVal = document.getElementById("conv-time").value;
  const sourceIndex = parseInt(
    document.getElementById("conv-country").value,
  );
  if (!timeVal || isNaN(sourceIndex) || !activeClocks[sourceIndex]) return;

  const [hour, minute] = timeVal.split(":").map(Number);
  const country = COUNTRIES[activeClocks[sourceIndex].countryIndex];
  converterRefDate = localTimeToUTC(hour, minute, country.timezone);
  updateClocks();
}

// Convert a local hour:minute in the given timezone to a UTC Date
function localTimeToUTC(hour, minute, timezone) {
  const now = new Date();
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  // Naively treat the desired time as UTC
  const candidate = new Date(
    `${localDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`,
  );

  // What local time does the candidate show in the target timezone?
  const candidateHour =
    parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }).format(candidate),
    ) % 24;

  const candidateMinute = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      minute: "numeric",
    }).format(candidate),
  );

  // Adjust by the difference to get the true UTC time
  let diffMinutes =
    candidateHour * 60 + candidateMinute - (hour * 60 + minute);
  if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60;
  if (diffMinutes < -12 * 60) diffMinutes += 24 * 60;

  return new Date(candidate.getTime() - diffMinutes * 60 * 1000);
}

// Start updating clocks
function startClockUpdates() {
  updateClocks();
  updateInterval = setInterval(updateClocks, 100);
}
