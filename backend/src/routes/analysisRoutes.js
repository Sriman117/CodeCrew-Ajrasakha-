const express = require("express");
const router = express.Router();



/**
 * POST /api/analyze
 * Body:
 * {
 *   soil: { N, P, K, OC?, pH },
 *   crop: "wheat" | "rice" | "cotton",
 *   farmSize: number
 * }
 */
const analysisController = require("../controllers/analysisController");

router.post("/analyze", analysisController.analyzeSoil);

module.exports = router;
