const express = require("express");
const router = express.Router();
const { ambulances } = require("../data/mockData");
const realtime = require("../socket/realtime");

// GET /api/ambulances?status=Available
router.get("/", (req, res) => {
  const { status } = req.query;
  const list = status && status !== "All" ? ambulances.filter(a => a.status === status) : ambulances;
  res.json(list);
});

// GET /api/ambulances/:id
router.get("/:id", (req, res) => {
  const amb = ambulances.find(a => a.id === req.params.id);
  if (!amb) return res.status(404).json({ error: "Not found" });
  res.json(amb);
});

// PATCH /api/ambulances/:id — update status/location (e.g. from a driver app)
router.patch("/:id", (req, res) => {
  const amb = ambulances.find(a => a.id === req.params.id);
  if (!amb) return res.status(404).json({ error: "Not found" });
  Object.assign(amb, req.body);
  realtime.broadcast("ambulance:updated", amb);
  res.json(amb);
});

module.exports = router;
