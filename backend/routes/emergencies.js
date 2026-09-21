const express = require("express");
const router = express.Router();
const { ambulances, emergencies, history } = require("../data/mockData");
const hospitalMatching = require("../services/hospitalMatching");
const routingEngine = require("../services/routingEngine");
const { hospitals } = require("../data/mockData");
const realtime = require("../socket/realtime");

let counter = 3395;

// GET /api/emergencies — all active emergencies (priority queue)
router.get("/", (req, res) => {
  const priorityWeight = { Critical: 100, High: 75, Medium: 50, Low: 25 };
  const sorted = [...emergencies].sort(
    (a, b) => priorityWeight[b.severity] - priorityWeight[a.severity]
  );
  res.json(sorted);
});

// GET /api/emergencies/history — completed cases
router.get("/history", (req, res) => {
  res.json(history);
});

// POST /api/emergencies — create a new emergency, run the matching pipeline
router.post("/", (req, res) => {
  const { type, severity, location, patients, age, special } = req.body || {};
  if (!type || !severity || !location) {
    return res.status(400).json({ error: "type, severity and location are required" });
  }

  counter += 1;
  const id = `EMG-${counter}`;

  const ambulance = ambulances.find(a => a.status === "Available") || ambulances[0];
  const { recommended, reason } = hospitalMatching.recommend(hospitals);
  const { best } = routingEngine.pickBestRoute();

  const now = () => new Date().toTimeString().slice(0, 5);
  const record = {
    id,
    type,
    severity,
    location,
    patients: patients || 1,
    age: age || null,
    special: special || null,
    ambulance: ambulance.id,
    hospital: recommended.name,
    hospitalReason: reason,
    route: `Route ${best.id} · ${best.distanceKm} km`,
    eta: `${best.etaMin} min`,
    traffic: best.traffic,
    corridor: "Activating",
    createdAt: new Date().toISOString(),
    timeline: [
      { time: now(), label: "Emergency reported" },
      { time: now(), label: `Ambulance ${ambulance.id} assigned` },
      { time: now(), label: "Route optimized (AI)" },
      { time: now(), label: "Green corridor initiated" },
      { time: now(), label: `Hospital notified — ${recommended.name}` },
    ],
  };

  emergencies.push(record);
  ambulance.status = "Active";

  realtime.broadcast("emergency:created", record);

  res.status(201).json(record);
});

// GET /api/emergencies/:id
router.get("/:id", (req, res) => {
  const found = emergencies.find(e => e.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Not found" });
  res.json(found);
});

module.exports = router;
