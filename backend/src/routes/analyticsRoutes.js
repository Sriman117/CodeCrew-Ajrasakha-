const express = require("express");
const router = express.Router();
const SoilScan = require("../models/SoilScan");

/**
 * GET /api/analytics/metrics
 * Returns cumulative platform metrics
 */
router.get("/metrics", async (req, res) => {
  try {
    const totalScans = await SoilScan.countDocuments();

    const scans = await SoilScan.find();

    const totalDeficiencies = scans.reduce(
      (sum, scan) => sum + scan.deficiencies.length,
      0
    );

    const totalCost = scans.reduce(
      (sum, scan) => sum + scan.totalCost,
      0
    );

    res.json({
      totalScans,
      totalDeficiencies,
      totalCost
    });
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({
      error: "Failed to fetch metrics"
    });
  }
});

module.exports = router;
