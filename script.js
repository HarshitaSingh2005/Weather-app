/* ============================================================
   script.js  —  All logic for the Weather App
   ============================================================

   HOW IT WORKS (3 steps):
   1. searchCity()   → city name  →  geocoding API  →  lat/lon
   2. fetchWeather() → lat/lon    →  weather API    →  data
   3. renderAll()    → data       →  fills the HTML

   APIs used (both FREE — no account or API key needed):
   - https://geocoding-api.open-meteo.com  (city → coordinates)
   - https://api.open-meteo.com            (coordinates → weather)
   ============================================================ */


/* ------------------------------------------------------------
   WMO WEATHER CODE TABLES
   Open-Meteo returns numeric WMO codes (0, 1, 2, 61 …)
   We convert them to a readable label and an emoji.
------------------------------------------------------------ */
const WMO_ICON = {
  0:'☀️',  1:'🌤️',  2:'⛅',  3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'🌨️', 73:'❄️',  75:'❄️',
  80:'🌦️', 81:'🌦️', 82:'⛈️',
  85:'🌨️', 86:'❄️',
  95:'⛈️', 96:'⛈️', 99:'⛈️'
};

const WMO_DESC = {
  0:'Sunny',        1:'Sunny',          2:'Partly cloudy',  3:'Cloudy',
  45:'Foggy',       48:'Foggy',
  51:'Drizzle',     53:'Drizzle',       55:'Drizzle',
  61:'Rainy',       63:'Rainy',         65:'Rainy',
  71:'Snowy',       73:'Snowy',         75:'Snowy',
  80:'Showers',     81:'Showers',       82:'Stormy',
  85:'Snow showers',86:'Snow showers',
  95:'Storm',       96:'Storm',         99:'Storm'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


/* ------------------------------------------------------------
   STEP 1 — searchCity()
   Triggered by the Search button or pressing Enter.
   Converts city name → latitude & longitude via
   Open-Meteo's free Geocoding API.
------------------------------------------------------------ */
function searchCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  showLoading();

  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  fetch(geoURL)
    .then(response => response.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        showError();
        return;
      }
      const place        = data.results[0];
      const locationName = place.name + ', ' + (place.country || '');
      // Hand off to Step 2
      fetchWeather(place.latitude, place.longitude, locationName);
    })
    .catch(showError);
}


/* ------------------------------------------------------------
   STEP 2 — fetchWeather(lat, lon, locationName)
   Uses coordinates to call Open-Meteo's weather API.
   Requests: current conditions + hourly temps + 7-day daily.
------------------------------------------------------------ */
function fetchWeather(lat, lon, locationName) {
  const weatherURL =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,precipitation_probability` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max` +
    `&timezone=auto&forecast_days=7`;

  fetch(weatherURL)
    .then(response => response.json())
    .then(data => renderAll(data, locationName))
    .catch(showError);
}


/* ------------------------------------------------------------
   STEP 3 — renderAll(data, locationName)
   Reads the API response object and writes every value
   into the matching HTML element by its id.
------------------------------------------------------------ */
function renderAll(data, locationName) {
  const cur    = data.current;
  const daily  = data.daily;
  const hourly = data.hourly;

  /* ---- HERO section ---- */
  document.getElementById('cityName').textContent   = locationName;
  document.getElementById('bigTemp').textContent    = Math.round(cur.temperature_2m) + '°';
  document.getElementById('heroIcon').textContent   = WMO_ICON[cur.weather_code] || '🌡️';
  document.getElementById('rainChance').textContent =
    'Chance of rain: ' + (cur.precipitation_probability ?? daily.precipitation_probability_max[0] ?? 0) + '%';

  /* ---- AIR CONDITIONS section ---- */
  document.getElementById('realFeel').textContent  = Math.round(cur.apparent_temperature) + '°';
  document.getElementById('windSpeed').textContent = Math.round(cur.wind_speed_10m) + ' km/h';
  document.getElementById('rainVal').textContent   = (daily.precipitation_probability_max[0] ?? 0) + '%';
  document.getElementById('uvIndex').textContent   = Math.round(daily.uv_index_max[0] ?? 0);

  /* ---- HOURLY section (6 slots, 3 hours apart) ---- */
  const currentHour = new Date().getHours();
  let startIdx = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]).getHours() >= currentHour) {
      startIdx = i;
      break;
    }
  }

  const slots = [];
  for (let i = 0; i < 6; i++) {
    const idx = startIdx + i * 3;
    if (idx < hourly.time.length) {
      slots.push({
        time: hourly.time[idx],
        temp: hourly.temperature_2m[idx],
        code: hourly.weather_code[idx]
      });
    }
  }

  document.getElementById('hourlyRow').innerHTML = slots.map(s => {
    const label = new Date(s.time).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
    return `
      <div class="hour-item">
        <div class="time">${label}</div>
        <div class="icon">${WMO_ICON[s.code] || '🌡️'}</div>
        <div class="temp">${Math.round(s.temp)}°</div>
      </div>`;
  }).join('');

  /* ---- 7-DAY FORECAST section ---- */
  document.getElementById('forecastList').innerHTML = daily.time.map((dateStr, i) => {
    const d    = new Date(dateStr);
    const day  = i === 0 ? 'Today' : DAY_NAMES[d.getDay()];
    const icon = WMO_ICON[daily.weather_code[i]] || '🌡️';
    const desc = WMO_DESC[daily.weather_code[i]] || 'Unknown';
    const hi   = Math.round(daily.temperature_2m_max[i]);
    const lo   = Math.round(daily.temperature_2m_min[i]);
    return `
      <div class="forecast-item">
        <div class="day-name">${day}</div>
        <div class="f-icon">${icon}</div>
        <div class="f-condition">${desc}</div>
        <div class="f-temps">${hi}° <span class="lo">/${lo}°</span></div>
      </div>`;
  }).join('');

  /* ---- Show the content, hide loading spinner ---- */
  document.getElementById('loadingMsg').style.display      = 'none';
  document.getElementById('weatherContent').style.display  = 'flex';
  document.getElementById('errorMsg').style.display        = 'none';
}


/* ------------------------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------------------ */
function showLoading() {
  document.getElementById('loadingMsg').style.display     = 'block';
  document.getElementById('weatherContent').style.display = 'none';
  document.getElementById('errorMsg').style.display       = 'none';
}

function showError() {
  document.getElementById('loadingMsg').style.display = 'none';
  document.getElementById('errorMsg').style.display   = 'block';
}

/* Allow pressing Enter key in the search box */
document.getElementById('cityInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchCity();
});

/* Auto-load Ranchi weather when the page first opens */
searchCity();