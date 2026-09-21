/**
 * RESQFLOW — main application controller
 */
document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupNav();
  setupHero();
  RESQ.initCounters();
  setupForm();
  await renderQueue();
  renderRoutes();
  setupReroute();
  await renderAmbulances();
  await renderHospitals();
  renderSignals();
  await renderHistory();
  await renderAnalytics();
  renderResponder();
  setupResponder();
  RESQ.renderNotifications();
  setupAssistant();
  setupIncidentMonitor();
  setupDemo();
}

/* ---------------- navigation ---------------- */
function setupNav() {
  const links = document.querySelectorAll("[data-nav]");
  const views = document.querySelectorAll(".view");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  function activate(name) {
    views.forEach(v => v.classList.toggle("is-active", v.dataset.view === name));
    links.forEach(l => l.classList.toggle("is-active", l.dataset.nav === name));
    if (name === "map") requestAnimationFrame(() => RESQ_MAP.renderFull(document.getElementById("liveMap")));
    navLinks.classList.remove("is-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  links.forEach(l => l.addEventListener("click", (e) => {
    e.preventDefault();
    history.pushState(null, "", `#${l.dataset.nav}`);
    activate(l.dataset.nav);
  }));

  burger?.addEventListener("click", () => navLinks.classList.toggle("is-open"));

  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const initial = (location.hash || "#landing").slice(1);
  activate(["landing","control","map","ambulances","hospitals","corridor","responder","operations","analytics","about"].includes(initial) ? initial : "landing");
}

/* ---------------- hero map ---------------- */
function setupHero() {
  RESQ_MAP.renderHero(document.getElementById("heroCitySvg"));
}

/* ---------------- emergency request form ---------------- */
function setupForm() {
  document.querySelectorAll("#locSeg .seg__opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#locSeg .seg__opt").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const input = document.getElementById("fLocation");
      if (btn.dataset.loc === "current") input.value = "Sector 4, MG Road Junction";
      if (btn.dataset.loc === "manual") { input.value = ""; input.focus(); }
      if (btn.dataset.loc === "map") input.value = "Selected on map: 16.51°N, 80.63°E";
    });
  });

  document.querySelectorAll("#sevSeg .seg__opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sevSeg .seg__opt").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  document.getElementById("emergencyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("fType").value;
    const severity = document.querySelector("#sevSeg .is-active").dataset.sev;
    const location = document.getElementById("fLocation").value || "Unknown location";

    RESQ.notify("Emergency request received", "🚨");
    const result = await RESQ_API.createEmergency({ type, severity, location });
    showCase(result);
    await renderQueue(result);
    RESQ.notify(`Ambulance ${result.ambulance} assigned`, "🚑");
    await RESQ.wait(400);
    RESQ.notify("Green corridor activated", "🟢");
  });
}

function showCase(c) {
  const panel = document.getElementById("caseDetail");
  panel.hidden = false;
  document.getElementById("caseId").textContent = c.id;
  document.getElementById("caseTitle").textContent = `${c.type} — ${c.severity}`;
  document.getElementById("caseAmb").textContent = c.ambulance;
  document.getElementById("caseHosp").textContent = c.hospital;
  document.getElementById("caseRoute").textContent = c.route;
  document.getElementById("caseEta").textContent = c.eta;
  document.getElementById("caseTraffic").textContent = c.traffic;
  document.getElementById("caseCorridor").textContent = c.corridor;
  document.getElementById("caseTimeline").innerHTML = c.timeline.map(t => `
    <div class="timeline-item"><time>${t.time}</time><span>${t.label}</span></div>
  `).join("");
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------------- priority queue ---------------- */
async function renderQueue(newCase) {
  const box = document.getElementById("priorityQueue");
  if (!box) return;
  const mockQueue = [
    { id: "EMG-3399", type: "Cardiac Emergency", severity: "Critical" },
    { id: "EMG-3398", type: "Trauma", severity: "High" },
    { id: "EMG-3397", type: "Accident", severity: "Medium" },
    { id: "EMG-3395", type: "Medical Emergency", severity: "Low" },
  ];
  const items = newCase ? [{ id: newCase.id, type: newCase.type, severity: newCase.severity }, ...mockQueue] : mockQueue;
  const sorted = items.sort((a, b) => RESQ_DATA.priorityWeights[b.severity] - RESQ_DATA.priorityWeights[a.severity]);
  box.innerHTML = sorted.map(i => `
    <div class="queue-item">
      <div class="queue-item__left">
        <span class="queue-item__id">${i.id}</span>
        <span class="queue-item__type">${i.type}</span>
      </div>
      <span class="sev-badge sev-badge--${i.severity}">${i.severity}</span>
    </div>
  `).join("");
}

/* ---------------- AI routing ---------------- */
function renderRoutes() {
  const grid = document.getElementById("routesGrid");
  if (!grid) return;
  grid.innerHTML = RESQ_DATA.routes.map(r => `
    <div class="route-card ${r.id === RESQ_DATA.bestRouteId ? "is-best" : ""}">
      <h4>Route ${r.id} ${r.id === RESQ_DATA.bestRouteId ? "★" : ""}</h4>
      <dl>
        <dt>Distance</dt><dd>${r.distance}</dd>
        <dt>ETA</dt><dd>${r.eta}</dd>
        <dt>Traffic</dt><dd>${r.traffic}</dd>
        <dt>Risk</dt><dd>${r.risk}</dd>
      </dl>
    </div>
  `).join("");
  document.getElementById("aiPick").innerHTML =
    `<strong>AI Recommended — Route ${RESQ_DATA.bestRouteId}.</strong> ${RESQ_DATA.bestRouteReason}`;
}

/* ---------------- dynamic rerouting ---------------- */
function setupReroute() {
  const btn = document.getElementById("btnBlock");
  const box = document.getElementById("rerouteBox");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    box.classList.add("is-alert");
    box.textContent = "🚧 ROAD BLOCK DETECTED — Accident detected 1.2 km ahead. Recalculating…";
    RESQ.notify("Road blockage detected", "🚧");
    await RESQ.wait(1200);
    const result = await RESQ_API.simulateBlockage({});
    box.innerHTML = `
      🔄 <strong>New route active.</strong>
      Previous ETA <strong>${result.previousEta}</strong> → New ETA <strong>${result.newEta}</strong>
      — time saved <strong>${result.savedSeconds}s</strong>.
    `;
    RESQ.notify("Route recalculated", "🔄");
  });
}

/* ---------------- ambulances ---------------- */
async function renderAmbulances() {
  const grid = document.getElementById("ambGrid");
  if (!grid) return;
  const data = await RESQ_API.getAmbulances();

  function draw(filter) {
    const filtered = filter === "All" ? data : data.filter(a => a.status === filter);
    grid.innerHTML = filtered.map(a => `
      <div class="info-card glass">
        <div class="info-card__head">
          <h3>${a.id}</h3>
          <span class="pill ${RESQ.statusClass(a.status)}">${a.status.toUpperCase()}</span>
        </div>
        <dl>
          <dt>Driver</dt><dd>${a.driver}</dd>
          <dt>Location</dt><dd>${a.location}</dd>
          <dt>Speed</dt><dd>${a.speed} km/h</dd>
          <dt>ETA</dt><dd>${a.eta}</dd>
          <dt>Hospital</dt><dd>${a.hospital}</dd>
        </dl>
      </div>
    `).join("") || `<p class="muted">No ambulances match this filter.</p>`;
  }
  draw("All");

  document.querySelectorAll("#ambFilters .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#ambFilters .chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      draw(chip.dataset.filter);
    });
  });
}

/* ---------------- hospitals ---------------- */
async function renderHospitals() {
  const grid = document.getElementById("hospGrid");
  if (!grid) return;
  const data = await RESQ_API.getHospitals();
  const ranked = [...data].sort((a, b) => b.score - a.score);
  grid.innerHTML = ranked.map((h, i) => `
    <div class="info-card glass">
      <div class="info-card__head">
        <h3>${h.name} ${i === 0 ? "— Recommended" : ""}</h3>
        <div class="score-ring" style="background:conic-gradient(${scoreColor(h.score)} ${h.score}%, rgba(255,255,255,.06) 0)">
          <span style="background:#0c101c;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${h.score}</span>
        </div>
      </div>
      <dl>
        <dt>Distance</dt><dd>${h.distance}</dd>
        <dt>ETA</dt><dd>${h.eta}</dd>
        <dt>ICU</dt><dd>${h.icu}</dd>
        <dt>Emergency</dt><dd>${h.emergency}</dd>
        <dt>Trauma</dt><dd>${h.trauma}</dd>
        <dt>Current load</dt><dd>${h.load}%</dd>
      </dl>
    </div>
  `).join("");
}
function scoreColor(score) {
  if (score >= 90) return "rgba(52,211,153,1)";
  if (score >= 80) return "rgba(34,211,238,1)";
  return "rgba(251,191,36,1)";
}

/* ---------------- green corridor signals ---------------- */
function renderSignals() {
  const row = document.getElementById("signalRow");
  if (!row) return;
  row.innerHTML = RESQ_DATA.signals.map(s => `
    <div class="signal">
      <div class="signal__light is-${s.state}"></div>
      Signal ${s.id}
    </div>
  `).join("");
}

function renderResponder() {
  const queue = document.getElementById("responderQueue");
  if (queue) {
    const items = [
      { id: "EMG-3399", type: "Cardiac Emergency", severity: "Critical" },
      { id: "EMG-3398", type: "Trauma", severity: "High" },
      { id: "EMG-3397", type: "Accident", severity: "Medium" },
      { id: "EMG-3395", type: "Medical Emergency", severity: "Low" },
    ];
    queue.innerHTML = items.map(item => `
      <div class="queue-item"><div class="queue-item__left"><span class="queue-item__id">${item.id}</span><span class="queue-item__type">${item.type}</span></div><span class="sev-badge sev-badge--${item.severity}">${item.severity}</span></div>
    `).join("");
  }
  const signals = document.getElementById("responderSignals");
  if (signals) {
    signals.innerHTML = RESQ_DATA.signals.slice(0, 8).map(s => `<div class="signal"><div class="signal__light is-${s.state}"></div>Signal ${s.id}</div>`).join("");
  }
}

function setupResponder() {
  document.getElementById("btnPriorityGreen")?.addEventListener("click", () => {
    RESQ_DATA.signals.slice(0, 5).forEach(signal => { signal.state = "green"; });
    renderSignals();
    renderResponder();
    RESQ.notify("Priority green activated for AMB-204", "🟢");
  });
  document.getElementById("btnResponderDemo")?.addEventListener("click", () => RESQ_DEMO.run());
}

function setupAssistant() {
  const launcher = document.getElementById("assistantLauncher");
  const panel = document.getElementById("assistantPanel");
  const close = document.getElementById("assistantClose");
  const form = document.getElementById("assistantForm");
  const input = document.getElementById("assistantInput");
  const messages = document.getElementById("assistantMessages");
  if (!launcher || !panel || !form || !input || !messages) return;

  const toggle = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  };
  const addMessage = (text, type) => {
    const message = document.createElement("div");
    message.className = `assistant-message assistant-message--${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };
  const answer = (question) => {
    const query = question.toLowerCase();
    if (query.includes("route") || query.includes("fastest")) {
      return `Route B is recommended: 8.1 km, 8 min, low traffic, and low risk. It is longer than Route C, but predicted traffic makes it 27% faster.`;
    }
    if (query.includes("hospital") || query.includes("icu")) {
      return `City Care Hospital leads with an AI score of 94/100. ICU, emergency, trauma, and cardiac capacity are currently available.`;
    }
    if (query.includes("corridor") || query.includes("signal")) {
      return `The simulated green corridor coordinates 12 signals along the ambulance route. Five signals are currently prepared for priority passage.`;
    }
    if (query.includes("eta") || query.includes("time")) {
      return `The current simulated ETA is 07:18 with 91% confidence. Traffic density is 45% and the ambulance is travelling at 62 km/h.`;
    }
    if (query.includes("demo") || query.includes("simulation") || query.includes("emergency")) {
      return `Open Emergency Control Center and choose Run Emergency Simulation. I will track the 11-step scenario in the notification feed.`;
    }
    return `I can help with the recommended route, ETA prediction, hospital matching, green corridor status, or the emergency simulation.`;
  };
  const submit = (value) => {
    const question = value.trim();
    if (!question) return;
    addMessage(question, "user");
    input.value = "";
    window.setTimeout(() => addMessage(answer(question), "bot"), 180);
  };

  launcher.addEventListener("click", () => toggle(panel.hidden));
  close?.addEventListener("click", () => toggle(false));
  form.addEventListener("submit", (event) => { event.preventDefault(); submit(input.value); });
  document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => submit(button.dataset.prompt)));
}

const RESQ_INCIDENTS = [
  { location: "MG Road Junction", detail: "Two-vehicle collision reported nearby", severity: "High" },
  { location: "Sector 4 Flyover", detail: "Road accident with traffic slowing in both lanes", severity: "Critical" },
  { location: "Riverside Avenue", detail: "Minor accident blocking the left lane", severity: "Medium" },
  { location: "North Ring Road", detail: "Multiple-vehicle incident detected by traffic network", severity: "High" },
];
let RESQ_INCIDENT_TIMER;
let RESQ_COUNTDOWN_TIMER;
let RESQ_COUNTDOWN = 60;

function setupIncidentMonitor() {
  document.getElementById("btnAccidentNow")?.addEventListener("click", () => simulateNearbyAccident(true));
  if (!document.getElementById("accidentCountdown")) return;
  RESQ_INCIDENT_TIMER = window.setInterval(() => simulateNearbyAccident(false), 60000);
  RESQ_COUNTDOWN_TIMER = window.setInterval(() => {
    RESQ_COUNTDOWN = RESQ_COUNTDOWN <= 1 ? 60 : RESQ_COUNTDOWN - 1;
    const countdown = document.getElementById("accidentCountdown");
    if (countdown) countdown.textContent = `${RESQ_COUNTDOWN}s`;
  }, 1000);
}

async function simulateNearbyAccident(manual = false) {
  const incident = RESQ_INCIDENTS[Math.floor(Math.random() * RESQ_INCIDENTS.length)];
  const id = `ACC-${String(Date.now()).slice(-5)}`;
  const ambulance = ["AMB-101", "AMB-104", "AMB-204"][Math.floor(Math.random() * 3)];
  const route = RESQ_DATA.routes.find(item => item.id === RESQ_DATA.bestRouteId);
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  RESQ_COUNTDOWN = 60;
  RESQ.notify(`Accident detected near ${incident.location}`, "🚨");
  updateIncidentStream({ ...incident, id, ambulance, route, now });
  updateFlowStep("alert");
  setFlowSummary("ALERT RECEIVED", `${incident.detail} · ${incident.severity} priority`);
  await RESQ.wait(550);
  RESQ.notify(`${ambulance} dispatched to ${incident.location}`, "🚑");
  updateFlowStep("ambulance");
  setFlowSummary("AMBULANCE ASSIGNED", `${ambulance} is the nearest available unit`);
  await RESQ.wait(550);
  RESQ.notify(`AI selected Route ${route.id} with ${route.traffic.toLowerCase()} traffic`, "🧠");
  updateFlowStep("routes");
  setFlowSummary("ROUTE OPTIMIZED", `Route ${route.id} · ${route.distance} · ETA ${route.eta}`);
  await RESQ.wait(550);
  RESQ.notify(`Green corridor active for ${ambulance}`, "🟢");
  updateFlowStep("moving");
  setFlowSummary("AMBULANCE MOVING", `Traffic signals coordinated · ${route.traffic} traffic`);
  await RESQ.wait(700);
  RESQ.notify("Hospital notified and ready for arrival", "🏥");
  updateFlowStep("hospital");
  setFlowSummary("HOSPITAL REACHED", "Emergency handoff complete · response loop continuing");
  if (manual) RESQ.toast("Manual accident simulation complete", "✅");
}

function updateFlowStep(activeStep) {
  const order = ["alert", "ambulance", "routes", "moving", "hospital"];
  const activeIndex = order.indexOf(activeStep);
  document.querySelectorAll("[data-flow-step]").forEach(node => {
    const index = order.indexOf(node.dataset.flowStep);
    node.classList.toggle("is-active", index === activeIndex);
    node.classList.toggle("is-done", index < activeIndex);
  });
  document.querySelectorAll(".flow-connector").forEach((connector, index) => connector.classList.toggle("is-live", index < activeIndex));
}

function setFlowSummary(status, detail) {
  const statusEl = document.getElementById("flowResponseStatus");
  const summary = document.getElementById("flowResponseSummary");
  if (statusEl) statusEl.textContent = status;
  if (summary) summary.innerHTML = `<strong>${status}</strong><span>${detail}</span>`;
}

function updateIncidentStream(incident) {
  const list = document.getElementById("incidentList");
  if (!list) return;
  const empty = list.querySelector(".empty-state");
  if (empty) empty.remove();
  const item = document.createElement("div");
  item.className = "incident-item";
  item.innerHTML = `<div class="incident-item__icon">🚨</div><div class="incident-item__body"><strong>${incident.id} · ${incident.location}</strong><span>${incident.detail}</span><small>${incident.now} · ${incident.ambulance} dispatched · Route ${incident.route.id}</small></div><span class="sev-badge sev-badge--${incident.severity}">${incident.severity}</span>`;
  list.prepend(item);
  while (list.children.length > 5) list.lastElementChild.remove();
  const count = document.getElementById("incidentCount");
  if (count) count.textContent = `${list.children.length} ALERTS`;
  const amb = document.getElementById("flowAmbulance");
  const route = document.getElementById("flowRoute");
  const eta = document.getElementById("flowEta");
  if (amb) amb.textContent = incident.ambulance;
  if (route) route.textContent = `Route ${incident.route.id}`;
  if (eta) eta.textContent = incident.route.eta;
}

/* ---------------- history table ---------------- */
async function renderHistory() {
  const body = document.getElementById("historyBody");
  if (!body) return;
  const data = await RESQ_API.getHistory();

  function draw(rows) {
    body.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td><td>${r.date}</td><td>${r.type}</td>
        <td><span class="sev-badge sev-badge--${r.severity}">${r.severity}</span></td>
        <td>${r.ambulance}</td><td>${r.hospital}</td>
        <td>${r.initialEta}</td><td>${r.finalEta}</td><td>${r.saved}</td><td>${r.status}</td>
      </tr>
    `).join("");
  }
  draw(data);

  document.getElementById("historySearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    draw(data.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.hospital.toLowerCase().includes(q)
    ));
  });
}

/* ---------------- analytics ---------------- */
async function renderAnalytics() {
  const data = await RESQ_API.getAnalytics();
  RESQ_CHARTS.renderAll(data);
}

/* ---------------- demo mode ---------------- */
function setupDemo() {
  document.getElementById("btnRunDemo")?.addEventListener("click", () => RESQ_DEMO.run());
  document.getElementById("demoClose")?.addEventListener("click", () => RESQ_DEMO.close());
  document.getElementById("demoDone")?.addEventListener("click", () => RESQ_DEMO.close());
}
