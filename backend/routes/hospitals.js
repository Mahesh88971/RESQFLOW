const express = require("express");
const router = express.Router();
const { hospitals } = require("../data/mockData");
const hospitalMatching = require("../services/hospitalMatching");

// GET /api/hospitals — ranked by capacity-aware score
router.get("/", (req, res) => {
  res.json(hospitalMatching.rankHospitals(hospitals));
});

// GET /api/hospitals/recommend — best match + reason
router.get("/recommend", (req, res) => {
  res.json(hospitalMatching.recommend(hospitals));
});

module.exports = router;
