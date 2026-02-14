const express = require("express");
const router = express.Router();

const interpret = require("../logic/interpretSoil");
const calculateDeficiency = require("../logic/calculateDeficiency");
const recommend = require("../logic/recommendFertilizer");

router.post("/analyze", (req, res) => {
  try {
    const { soil, crop, farmSize } = req.body;

    // Validate required fields
    if (!soil || !crop) {
      return res.status(400).json({
        error: "Soil data and crop are required."
      });
    }

    const { N, P, K, pH } = soil;

    if (
      N === undefined ||
      P === undefined ||
      K === undefined ||
      pH === undefined
    ) {
      return res.status(400).json({
        error: "Incomplete soil data."
      });
    }

    if (pH < 3 || pH > 9) {
      return res.status(400).json({
        error: "Soil pH must be between 3 and 9."
      });
    }

    if (N < 0 || P < 0 || K < 0) {
      return res.status(400).json({
        error: "NPK values cannot be negative."
      });
    }

    const interpretation = interpret(soil);
    const deficiencies = calculateDeficiency(soil, crop);
    const recommendationResult = recommend(
      deficiencies,
      farmSize || 1
    );

    return res.status(200).json({
      interpretation,
      deficiencies,
      recommendations: recommendationResult.recommendations,
      totalCost: recommendationResult.totalCost
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

module.exports = router;
