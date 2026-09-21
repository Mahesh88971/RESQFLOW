/**
 * RESQFLOW — Live map
 *
 * Renders a simulated city grid + animated ambulance route in SVG so the
 * prototype works with zero API keys. To use real Google Maps instead:
 *
 *   1. Get a Google Maps JavaScript API key: https://console.cloud.google.com/
 *   2. Add   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
 *      to index.html (never hardcode the key in a committed file — inject it
 *      at build/deploy time, e.g. via environment variable substitution).
 *   3. Replace renderCitySvg() below with a new.google.maps.Map(...) call and
 *      draw ambulance/hospital markers + a DirectionsRenderer for the route.
 *   4. The backend's services/mapsService.js already has a matching
 *      server-side placeholder for Directions/Distance Matrix calls.
 */

const RESQ_MAP = {

  // A small fixed "road graph" used to draw a believable city grid.
  roads: [
    [40, 60, 480, 60], [40, 140, 480, 140], [40, 220, 480, 220],
    [40, 300, 480, 300], [40, 60, 40, 300], [140, 60, 140, 300],
    [260, 60, 260, 300], [380, 60, 380, 300], [480, 60, 480, 300],
  ],
  roadsFull: [
    [60, 90, 840, 90], [60, 180, 840, 180], [60, 270, 840, 270],
    [60, 360, 840, 360], [60, 450, 840, 450],
    [60, 90, 60, 450], [220, 90, 220, 450], [400, 90, 400, 450],
    [580, 90, 580, 450], [760, 90, 760, 450], [840, 90, 840, 450],
  ],

  routePathHero: "M 60 270 L 260 270 L 260 140 L 420 140",
  routePathFull: "M 90 400 L 400 400 L 400 250 L 580 250 L 580 120 L 760 120",

  renderHero(svgEl) {
    if (!svgEl) return;
    const roads = this.roads.map(([x1, y1, x2, y2]) =>
      `<line class="map-road--minor" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,.07)" stroke-width="3"/>`
    ).join("");

    svgEl.innerHTML = `
      ${roads}
      <path d="${this.routePathHero}" class="map-route map-route--green" stroke-linecap="round"/>
      <circle cx="260" cy="270" r="7" class="map-amb"/>
      <circle cx="420" cy="140" r="6" class="map-hosp"/>
      <text x="270" y="265" fill="#AAB4D1" font-size="10" font-family="JetBrains Mono">AMB-204</text>
      <text x="430" y="135" fill="#AAB4D1" font-size="10" font-family="JetBrains Mono">Apollo</text>
      <circle cx="260" cy="140" r="4" class="map-signal is-green"/>
      <circle cx="140" cy="270" r="4" class="map-signal is-prep"/>
    `;
    this._animateDot(svgEl, this.routePathHero, "heroAmbDot");
  },

  renderFull(svgEl) {
    if (!svgEl) return;
    if (window.L && svgEl.id === "liveMap") {
      this.renderLeaflet(svgEl);
      return;
    }
    const roads = this.roadsFull.map(([x1, y1, x2, y2]) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,.09)" stroke-width="5"/>`
    ).join("");

    const hospitals = [
      { x: 400, y: 250, name: "City Care" },
      { x: 760, y: 120, name: "Apollo" },
      { x: 220, y: 450, name: "Metro" },
    ];
    const signals = [
      { x: 400, y: 400, s: "green" }, { x: 400, y: 250, s: "green" },
      { x: 580, y: 250, s: "green" }, { x: 580, y: 120, s: "prep" },
      { x: 220, y: 180, s: "red" }, { x: 760, y: 270, s: "red" },
    ];
    const roadblock = `<line x1="580" y1="160" x2="620" y2="160" class="map-block"/>`;

    svgEl.innerHTML = `
      ${roads}
      <path d="${this.routePathFull}" class="map-route map-route--green" stroke-linecap="round"/>
      ${roadblock}
      ${hospitals.map(h => `
        <circle cx="${h.x}" cy="${h.y}" r="8" class="map-hosp"/>
        <text x="${h.x + 10}" y="${h.y + 4}" fill="#AAB4D1" font-size="11" font-family="JetBrains Mono">${h.name}</text>
      `).join("")}
      ${signals.map(s => `<circle cx="${s.x}" cy="${s.y}" r="5" class="map-signal is-${s.s}"/>`).join("")}
      <circle cx="90" cy="400" r="9" class="map-amb" id="fullAmbDot"/>
      <text x="60" y="420" fill="#AAB4D1" font-size="11" font-family="JetBrains Mono">AMB-204</text>
    `;
    this._animateDot(svgEl, this.routePathFull, "fullAmbDot", 9000);
  },

  renderLeaflet(mapEl) {
    if (mapEl._resqMap) {
      mapEl._resqMap.invalidateSize();
      return;
    }
    const map = L.map(mapEl, { zoomControl: false, preferCanvas: true }).setView([16.515, 80.635], 13);
    mapEl._resqMap = map;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const ambulanceIcon = (status = "Active") => L.divIcon({ className: `leaflet-ambulance-marker is-${status.toLowerCase()}`, html: "<span>✚</span>", iconSize: [34, 34], iconAnchor: [17, 17] });
    const hospitalIcon = L.divIcon({ className: "leaflet-hospital-marker", html: "<span>+</span>", iconSize: [30, 30], iconAnchor: [15, 15] });
    const emergencyIcon = L.divIcon({ className: "leaflet-emergency-marker", html: "<span>!</span>", iconSize: [30, 30], iconAnchor: [15, 15] });
    const signalIcon = (state) => L.divIcon({ className: `leaflet-signal-marker is-${state}`, html: "<span></span>", iconSize: [16, 16], iconAnchor: [8, 8] });

    const route = [
      [16.504, 80.612], [16.507, 80.621], [16.510, 80.629],
      [16.514, 80.636], [16.520, 80.642], [16.526, 80.651]
    ];
    L.polyline(route, { color: "#52e0b1", weight: 8, opacity: .22 }).addTo(map);
    L.polyline(route, { color: "#7c6cff", weight: 4, dashArray: "12 9", lineCap: "round" }).addTo(map);

    L.marker(route[route.length - 1], { icon: hospitalIcon }).addTo(map).bindPopup("<strong>Apollo Emergency Center</strong><br>Emergency department ready");
    L.marker([16.501, 80.620], { icon: emergencyIcon }).addTo(map).bindPopup("<strong>EMG-3399</strong><br>Critical cardiac emergency");

    const fleetPositions = {
      "AMB-101": [16.511, 80.606],
      "AMB-102": [16.519, 80.617],
      "AMB-103": [16.526, 80.628],
      "AMB-104": [16.505, 80.646],
      "AMB-204": route[0],
      "AMB-118": [16.538, 80.613],
      "AMB-119": [16.497, 80.639],
      "AMB-120": [16.532, 80.651]
    };
    const fleet = typeof RESQ_DATA !== "undefined" && Array.isArray(RESQ_DATA.ambulances) ? RESQ_DATA.ambulances : [];
    fleet.forEach(ambulance => {
      if (ambulance.id === "AMB-204") return;
      const position = fleetPositions[ambulance.id];
      if (!position) return;
      const status = ambulance.status === "Available" ? "Available" : ambulance.status === "Hospital" ? "Hospital" : ambulance.status === "Maintenance" ? "Maintenance" : "Active";
      L.marker(position, { icon: ambulanceIcon(status) })
        .addTo(map)
        .bindPopup(`<strong>${ambulance.id}</strong><br>${ambulance.status} · ${ambulance.speed} km/h<br>Driver: ${ambulance.driver}<br>Location: ${ambulance.location}`)
        .bindTooltip(`${ambulance.id} · ${ambulance.status}`);
    });

    [
      [16.507, 80.621, "green"], [16.510, 80.629, "green"], [16.514, 80.636, "green"],
      [16.520, 80.642, "prep"], [16.523, 80.647, "red"], [16.517, 80.625, "red"]
    ].forEach(([lat, lng, state], index) => L.marker([lat, lng], { icon: signalIcon(state) }).addTo(map).bindTooltip(`Signal ${String(index + 1).padStart(2, "0")} · ${state}`));

    L.polyline([[16.518, 80.638], [16.523, 80.641]], { color: "#ff3b5c", weight: 7, dashArray: "4 6" }).addTo(map).bindTooltip("Roadblock detected · accident ahead");
    L.circle([16.526, 80.651], { radius: 280, color: "#52e0b1", fillColor: "#52e0b1", fillOpacity: .07, weight: 1 }).addTo(map);

    const movingMarker = L.marker(route[0], { icon: ambulanceIcon("Active") }).addTo(map).bindTooltip("AMB-204 · En route");
    let point = 0;
    const move = () => {
      point = (point + 1) % route.length;
      movingMarker.setLatLng(route[point]);
    };
    mapEl._resqAnimation = window.setInterval(move, 1800);
    map.fitBounds(L.latLngBounds(route), { padding: [30, 30] });
  },

  _animateDot(svgEl, pathD, dotId, duration = 6000) {
    const ns = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", pathD);
    const len = (() => {
      svgEl.appendChild(path);
      const l = path.getTotalLength();
      svgEl.removeChild(path);
      return l;
    })();

    const dot = svgEl.querySelector(`#${dotId}`) || svgEl.querySelector(".map-amb");
    if (!dot) return;
    const tmpPath = document.createElementNS(ns, "path");
    tmpPath.setAttribute("d", pathD);

    let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const t = ((ts - start) % duration) / duration;
      const point = tmpPath.getPointAtLength ? getPointAtLengthPolyfill(tmpPath, len * t) : null;
      if (point) {
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
      }
      requestAnimationFrame(frame);
    }
    function getPointAtLengthPolyfill(el, length) {
      try { return el.getPointAtLength(length); } catch (e) { return null; }
    }
    // path element needs to be in DOM to compute points reliably in some browsers
    tmpPath.style.display = "none";
    svgEl.appendChild(tmpPath);
    requestAnimationFrame(frame);
  },
};
