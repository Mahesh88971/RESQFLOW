# RESQFLOW — AI-Powered Emergency Response & Dynamic Routing

**Every Second Matters.**

A hackathon prototype of an emergency-response command platform: ambulance
dispatch, AI-assisted routing, a simulated green corridor, capacity-aware
hospital matching, live tracking and analytics — all wrapped in a glass,
dark-command-center UI.

```
resqflow/
├── frontend/        static site — open directly or serve with any web server
│   ├── index.html
│   ├── css/style.css
│   ├── js/              app.js, api.js, map.js, charts.js, demo.js, data.js, utils.js
│   └── assets/           logo.svg, favicon.svg
└── backend/          Node.js + Express + Socket.IO API
    ├── server.js
    ├── routes/            emergencies, ambulances, hospitals, routing, analytics
    ├── services/          routingEngine, etaPrediction, hospitalMatching, mapsService
    ├── socket/            realtime.js (Socket.IO broadcast helper)
    └── data/              mockData.js (swap for MongoDB later)
```

## Quick start — frontend only (works with zero setup)

The frontend runs entirely on simulated/mock data out of the box — no
`npm install`, no API keys, no backend required.

1. Open `frontend/index.html` directly in a browser, **or** serve it so
   relative paths behave consistently:
   ```bash
   cd frontend
   npx serve .
   # or: python3 -m http.server 5173
   ```
2. Click **Launch Emergency Control Center**, then **🚨 Run Emergency
   Simulation** for the full cinematic demo.

## Running the real backend

The backend is a genuine Express + Socket.IO API with in-memory mock data.
The frontend will use it automatically once you point it there.

```bash
cd backend
npm install
cp .env.example .env      # fill in values if you have them
npm start                 # or: npm run dev (nodemon, auto-reload)
```

This starts the API at `http://localhost:4000` with endpoints including:

- `GET  /api/ambulances`
- `GET  /api/hospitals`
- `GET  /api/emergencies/history`
- `POST /api/emergencies`           — create a case, runs matching + routing
- `POST /api/routing/reroute`       — simulate a blockage and recalculate
- `GET  /api/analytics`
- Socket.IO events: `emergency:created`, `ambulance:updated`, `route:recalculated`

### Connecting the frontend to the backend

In `frontend/index.html`, before the other scripts load, set:

```html
<script>
  window.RESQ_USE_BACKEND = true;
  window.RESQ_API_BASE = "http://localhost:4000";
</script>
```

Everything else keeps working unchanged — `frontend/js/api.js` is the single
file that decides whether data comes from the backend or from local mock
data, and it falls back to mock data automatically if a request fails.

## Connecting Google Maps

The live map ships as a simulated SVG city grid so judges see a convincing
map with zero setup. To use real Google Maps:

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   with the **Maps JavaScript API**, **Directions API** and **Distance
   Matrix API** enabled.
2. **Frontend map tiles:** add
   `<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>`
   to `index.html` and replace `RESQ_MAP.renderFull()` in `js/map.js` with a
   `new google.maps.Map(...)` instance, drawing ambulance/hospital markers
   and a `DirectionsRenderer`.
3. **Backend routing:** put the key server-side only, in `backend/.env` as
   `GOOGLE_MAPS_API_KEY` — never in frontend code — and implement the two
   placeholder functions in `backend/services/mapsService.js`
   (`getDirections`, `getEtaWithTraffic`). `routes/routing.js` can then call
   those instead of the simulated `routingEngine.js`.

## Notes for judges

- All emergencies, patients, ambulance positions and hospital loads are
  **simulated demonstration data** — no real patient data is used anywhere.
- Green corridor signal control and the live map are explicitly simulated;
  no real traffic-signal system is connected.
- The codebase is structured so every simulated piece (routing, ETA
  prediction, hospital scoring, maps) has a clearly marked seam for
  swapping in a real API or trained model without touching UI code.

Built for Hackathon 2026.
