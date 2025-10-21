// List of countries with time zones
const COUNTRIES = [
  { name: "Poland", timezone: "Europe/Warsaw", locale: "pl-PL", fixed: true },
  { name: "Australia (Sydney)", timezone: "Australia/Sydney", locale: "en-AU" },
  {
    name: "Brazil (São Paulo)",
    timezone: "America/Sao_Paulo",
    locale: "pt-BR",
  },
  { name: "Bulgaria", timezone: "Europe/Sofia", locale: "bg-BG" },
  { name: "China (Beijing)", timezone: "Asia/Shanghai", locale: "zh-CN" },
  { name: "Dubai (UAE)", timezone: "Asia/Dubai", locale: "ar-AE" },
  { name: "Egypt", timezone: "Africa/Cairo", locale: "ar-EG" },
  { name: "Estonia", timezone: "Europe/Tallinn", locale: "et-EE" },
  { name: "Finland", timezone: "Europe/Helsinki", locale: "fi-FI" },
  { name: "Greece", timezone: "Europe/Athens", locale: "el-GR" },
  { name: "Spain", timezone: "Europe/Madrid", locale: "es-ES" },
  { name: "Netherlands", timezone: "Europe/Amsterdam", locale: "nl-NL" },
  { name: "India (Delhi)", timezone: "Asia/Kolkata", locale: "hi-IN" },
  { name: "Indonesia (Jakarta)", timezone: "Asia/Jakarta", locale: "id-ID" },
  { name: "Iraq (Baghdad)", timezone: "Asia/Baghdad", locale: "ar-IQ" },
  { name: "Iran (Tehran)", timezone: "Asia/Tehran", locale: "fa-IR" },
  { name: "Ireland", timezone: "Europe/Dublin", locale: "en-IE" },
  { name: "Iceland", timezone: "Atlantic/Reykjavik", locale: "is-IS" },
  { name: "Israel", timezone: "Asia/Jerusalem", locale: "he-IL" },
  { name: "Japan (Tokyo)", timezone: "Asia/Tokyo", locale: "ja-JP" },
  { name: "Canada (Toronto)", timezone: "America/Toronto", locale: "en-CA" },
  {
    name: "Canada (Vancouver)",
    timezone: "America/Vancouver",
    locale: "en-CA",
  },
  { name: "South Korea (Seoul)", timezone: "Asia/Seoul", locale: "ko-KR" },
  { name: "Lithuania", timezone: "Europe/Vilnius", locale: "lt-LT" },
  { name: "Latvia", timezone: "Europe/Riga", locale: "lv-LV" },
  { name: "Mexico", timezone: "America/Mexico_City", locale: "es-MX" },
  { name: "New Zealand", timezone: "Pacific/Auckland", locale: "en-NZ" },
  { name: "New York (USA)", timezone: "America/New_York", locale: "en-US" },
  { name: "Portugal", timezone: "Europe/Lisbon", locale: "pt-PT" },
  { name: "Russia (Moscow)", timezone: "Europe/Moscow", locale: "ru-RU" },
  { name: "Romania", timezone: "Europe/Bucharest", locale: "ro-RO" },
  { name: "Singapore", timezone: "Asia/Singapore", locale: "en-SG" },
  { name: "Turkey", timezone: "Europe/Istanbul", locale: "tr-TR" },
  { name: "Ukraine", timezone: "Europe/Kiev", locale: "uk-UA" },
  {
    name: "USA (Los Angeles)",
    timezone: "America/Los_Angeles",
    locale: "en-US",
  },
  { name: "USA (Chicago)", timezone: "America/Chicago", locale: "en-US" },
  { name: "USA (Denver)", timezone: "America/Denver", locale: "en-US" },
  {
    name: "Vietnam (Ho Chi Minh)",
    timezone: "Asia/Ho_Chi_Minh",
    locale: "vi-VN",
  },
  { name: "United Kingdom", timezone: "Europe/London", locale: "en-GB" },
  {
    name: "Saudi Arabia (Riyadh)",
    timezone: "Asia/Riyadh",
    locale: "ar-SA",
  },
  { name: "Philippines (Manila)", timezone: "Asia/Manila", locale: "fil-PH" },
  {
    name: "Malaysia (Kuala Lumpur)",
    timezone: "Asia/Kuala_Lumpur",
    locale: "ms-MY",
  },
  { name: "Pakistan (Karachi)", timezone: "Asia/Karachi", locale: "ur-PK" },
  { name: "Bangladesh (Dhaka)", timezone: "Asia/Dhaka", locale: "bn-BD" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong", locale: "zh-HK" },
  {
    name: "Mongolia (Ulaanbaatar)",
    timezone: "Asia/Ulaanbaatar",
    locale: "mn-MN",
  },
  { name: "Nepal (Kathmandu)", timezone: "Asia/Kathmandu", locale: "ne-NP" },
  { name: "Sri Lanka (Colombo)", timezone: "Asia/Colombo", locale: "si-LK" },
  { name: "Myanmar (Yangon)", timezone: "Asia/Yangon", locale: "my-MM" },
  {
    name: "Cambodia (Phnom Penh)",
    timezone: "Asia/Phnom_Penh",
    locale: "km-KH",
  },
  { name: "Laos (Vientiane)", timezone: "Asia/Vientiane", locale: "lo-LA" },
  {
    name: "South Africa (Johannesburg)",
    timezone: "Africa/Johannesburg",
    locale: "en-ZA",
  },
  { name: "Kenya (Nairobi)", timezone: "Africa/Nairobi", locale: "sw-KE" },
  { name: "Nigeria (Lagos)", timezone: "Africa/Lagos", locale: "en-NG" },
  {
    name: "Argentina (Buenos Aires)",
    timezone: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
  },
  { name: "Chile (Santiago)", timezone: "America/Santiago", locale: "es-CL" },
  { name: "Colombia (Bogota)", timezone: "America/Bogota", locale: "es-CO" },
  { name: "Peru (Lima)", timezone: "America/Lima", locale: "es-PE" },
  {
    name: "Australia (Melbourne)",
    timezone: "Australia/Melbourne",
    locale: "en-AU",
  },
  { name: "Australia (Perth)", timezone: "Australia/Perth", locale: "en-AU" },
];

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
    a.country.name.localeCompare(b.country.name)
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
