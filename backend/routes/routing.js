const express = require("express");
const router = express.Router();
const routingEngine = require("../services/routingEngine");
const etaPrediction = require("../services/etaPrediction");
const realtime = require("../socket/realtime");

// GET /api/routing/best — AI-recommended route among candidates
router.get("/best", (req, res) => {
  res.json(routingEngine.pickBestRoute());
});

// POST /api/routing/reroute — simulate a blockage and recalculate
router.post("/reroute", (req, res) => {
  const { previousEtaSeconds } = req.body || {};
  const result = routingEngine.recalculateAfterBlockage(previousEtaSeconds);
  realtime.broadcast("route:recalculated", result);
  res.json(result);
});

// POST /api/routing/eta — predicted ETA for given conditions
router.post("/eta", (req, res) => {
  const { distanceKm, trafficDensity, timeOfDay } = req.body || {};
  res.json(etaPrediction.predictEta({ distanceKm, trafficDensity, timeOfDay }));
});

module.exports = router;
