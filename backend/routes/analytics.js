const express = require("express");
const router = express.Router();
const { analytics } = require("../data/mockData");

// GET /api/analytics — chart-ready datasets for the analytics dashboard
router.get("/", (req, res) => {
  res.json(analytics);
});

module.exports = router;
