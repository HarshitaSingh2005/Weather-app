# 🌤️ Weather App

A clean, responsive weather dashboard built with vanilla HTML, CSS, and JavaScript — **no API key, no build tools, no dependencies**.
## ✨ Features

- 🔍 Search any city worldwide
- 🌡️ Current temperature, real feel & weather icon
- 🕐 Hourly forecast (6 time slots, 3 hours apart)
- 📅 7-day daily forecast
- 💨 Air conditions: wind speed, rain chance, UV index
- 📱 Responsive layout (mobile + desktop)
- ⚡ Auto-loads your default city on page open

## 🚀 Getting Started

### Run locally

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. Open `index.html` directly in your browser — no server needed.

That's it. The app fetches live weather data from free public APIs.

---


Live Demo

🌐 https://weather-app-hrshita.netlify.app/

## 📁 File Structure

weather-app/
├── index.html   # App markup
├── style.css    # All styles
└── script.js    # All logic (geocoding + weather fetch + render)


## 🌐 APIs Used

Both APIs are **completely free** — no account or API key required.

| API | Purpose | Endpoint |
|-----|---------|----------|
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City name → latitude & longitude | `geocoding-api.open-meteo.com` |
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Coordinates → weather data | `api.open-meteo.com` |

---

## 🔄 How It Works

```
User types city name
        ↓
searchCity()  →  Geocoding API  →  lat / lon
        ↓
fetchWeather()  →  Forecast API  →  JSON data
        ↓
renderAll()  →  Updates the DOM
```

---


## ⚙️ Customisation

**Change the default city**  
Edit the `value` attribute on the search input in `index.html`:
```html
<input type="text" id="cityInput" value="Your City Here" />
```

**Switch to Fahrenheit**  
Add `&temperature_unit=fahrenheit` to the API URL in `fetchWeather()`, then update the `°` labels.

**Show more hourly slots**  
In `renderAll()`, increase the loop count (currently `6`) and adjust the time step (currently every `3` hours):
```js
for (let i = 0; i < 8; i++) {       // 8 slots
  const idx = startIdx + i * 2;     // every 2 hours
```

---

## 🛠️ Tech Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 |
| Styling | CSS3 (Flexbox + Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Data | Open-Meteo REST APIs |
| Build | None |

---
