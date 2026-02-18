const interpretSoil = require("../services/interpretSoil");
const calculateDeficiency = require("../services/calculateDeficiency");
const recommendFertilizer = require("../services/recommendFertilizer");
const SoilScan = require("../models/SoilScan");

exports.analyzeSoil = async (req, res) => {
    try {
        const { soil, crop, farmSize } = req.body;

        if (!soil || !crop || !farmSize) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        if (soil.pH < 3 || soil.pH > 9) {
            return res.status(400).json({
                error: "Soil pH must be between 3 and 9"
            });
        }

        /* ---------- LOGIC ENGINE ---------- */
        const interpretation = interpretSoil(soil);
        const deficiencies = calculateDeficiency(soil, crop);
        const recommendations = recommendFertilizer(deficiencies, farmSize);

        const totalCost = recommendations.reduce(
            (sum, item) => sum + (item.cost || 0),
            0
        );

        /* ---------- SAVE TO MONGODB ---------- */
        await SoilScan.create({
            soil,
            crop,
            farmSize,
            interpretation,
            deficiencies,
            recommendations,
            totalCost
        });

        /* ---------- RESPONSE ---------- */
        res.json({
            interpretation,
            deficiencies: deficiencies.map(d => ({
                nutrient: d.nutrient,
                status: d.status,
                deficiency_percentage: d.deficiency_percentage
            })),
            recommendations,
            totalCost
        });

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({
            error: "Analysis failed"
        });
    }
};
