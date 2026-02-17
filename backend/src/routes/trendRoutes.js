const express = require("express");
const router = express.Router();
const SoilScan = require("../models/SoilScan");

/**
 * GET /api/trends
 * Returns all scans sorted by date
 */
router.get("/", async (req, res) => {
  try {
    const scans = await SoilScan.find().sort({ scannedAt: 1 });
    res.json(scans);
  } catch (error) {
    console.error("Trend fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch trend data"
    });
  }
});

module.exports = router;
