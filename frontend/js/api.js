/**
 * RESQFLOW — API layer
 *
 * This is the ONLY file that should know whether data comes from the
 * real backend (/backend, Node + Express + Socket.IO) or from local mock
 * data. Swap BASE_URL / USE_BACKEND below once your backend is deployed,
 * and every screen keeps working unchanged.
 *
 * To connect the real backend:
 *   1. cd backend && npm install && npm start   (see backend/README section)
 *   2. Set RESQ_API.USE_BACKEND = true below (or window.RESQ_USE_BACKEND = true
 *      before this script loads)
 *   3. Set RESQ_API.BASE_URL to your backend origin, e.g. http://localhost:4000
 */
const RESQ_API = {
  USE_BACKEND: window.RESQ_USE_BACKEND || false,
  BASE_URL: window.RESQ_API_BASE || "http://localhost:4000",

  async _get(path, fallback) {
    if (!this.USE_BACKEND) return fallback;
    try {
      const res = await fetch(`${this.BASE_URL}${path}`);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.warn(`[RESQ_API] falling back to mock data for ${path}:`, err.message);
      return fallback;
    }
  },

  async _post(path, body, fallback) {
    if (!this.USE_BACKEND) return fallback;
    try {
      const res = await fetch(`${this.BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.warn(`[RESQ_API] falling back to mock data for ${path}:`, err.message);
      return fallback;
    }
  },

  getAmbulances() { return this._get("/api/ambulances", RESQ_DATA.ambulances); },
  getHospitals() { return this._get("/api/hospitals", RESQ_DATA.hospitals); },
  getHistory() { return this._get("/api/emergencies/history", RESQ_DATA.history); },
  getAnalytics() { return this._get("/api/analytics", RESQ_DATA.analytics); },

  createEmergency(payload) {
    const mockResult = RESQ_ENGINE.buildCase(payload);
    return this._post("/api/emergencies", payload, mockResult);
  },

  simulateBlockage(caseState) {
    const mockResult = RESQ_ENGINE.reroute(caseState);
    return this._post("/api/routing/reroute", caseState, mockResult);
  },
};

/**
 * RESQ_ENGINE — the local "AI" simulation used when no backend/ML model is
 * connected. Kept isolated so it can be deleted once a real routing /
 * ETA-prediction service is wired up through RESQ_API above.
 */
const RESQ_ENGINE = {
  buildCase(payload) {
    RESQ_EMG_COUNTER += 1;
    const id = `EMG-${RESQ_EMG_COUNTER}`;
    const ambulance = RESQ_DATA.ambulances.find(a => a.status === "Available") || RESQ_DATA.ambulances[0];
    const hospital = [...RESQ_DATA.hospitals].sort((a, b) => b.score - a.score)[0];
    const best = RESQ_DATA.routes.find(r => r.id === RESQ_DATA.bestRouteId);
    return {
      id,
      type: payload.type,
      severity: payload.severity,
      location: payload.location,
      ambulance: ambulance.id,
      hospital: hospital.name,
      route: `Route ${best.id} · ${best.distance}`,
      eta: best.eta,
      traffic: best.traffic,
      corridor: "Activating",
      timeline: [
        { time: RESQ_ENGINE._now(), label: "Emergency reported" },
        { time: RESQ_ENGINE._now(1), label: `Ambulance ${ambulance.id} assigned` },
        { time: RESQ_ENGINE._now(2), label: "Route optimized (AI)" },
        { time: RESQ_ENGINE._now(3), label: "Green corridor initiated" },
        { time: RESQ_ENGINE._now(5), label: `Hospital notified — ${hospital.name}` },
      ],
    };
  },

  reroute() {
    const prevSeconds = 7 * 60 + 32;
    const newSeconds = 6 * 60 + 51;
    return {
      previousEta: RESQ_ENGINE._fmt(prevSeconds),
      newEta: RESQ_ENGINE._fmt(newSeconds),
      savedSeconds: prevSeconds - newSeconds,
    };
  },

  _now(offsetMin = 0) {
    const d = new Date(Date.now() + offsetMin * 60000);
    return d.toTimeString().slice(0, 5);
  },
  _fmt(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  },
};
