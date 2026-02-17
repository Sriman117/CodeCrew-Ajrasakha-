const cropStandards = require("../data/cropStandards.json");
const soilRanges = require("../data/soilRanges.json");

function calculateDeficiency(soil, crop) {
  const deficiencies = [];
  const standards = cropStandards[crop];

  if (!standards) return deficiencies;

  // Nitrogen
  if (soil.N !== undefined && soil.N < standards.targetN) {
    const gap = standards.targetN - soil.N;
    const percentage = Math.round((gap / standards.targetN) * 100);

    deficiencies.push({
      nutrient: "Nitrogen",
      status: "Low",
      gap,
      deficiency_percentage: percentage
    });
  }

  // Phosphorus
  if (soil.P !== undefined && soil.P < standards.targetP) {
    const gap = standards.targetP - soil.P;
    const percentage = Math.round((gap / standards.targetP) * 100);

    deficiencies.push({
      nutrient: "Phosphorus",
      status: "Low",
      gap,
      deficiency_percentage: percentage
    });
  }

  // Potassium
  if (soil.K !== undefined && soil.K < standards.targetK) {
    const gap = standards.targetK - soil.K;
    const percentage = Math.round((gap / standards.targetK) * 100);

    deficiencies.push({
      nutrient: "Potassium",
      status: "Low",
      gap,
      deficiency_percentage: percentage
    });
  }

  // Organic Carbon
  if (
    soil.OC !== undefined &&
    soil.OC < soilRanges.OC.low
  ) {
    const gap = soilRanges.OC.low - soil.OC;
    const percentage = Math.round(
      (gap / soilRanges.OC.low) * 100
    );

    deficiencies.push({
      nutrient: "OC",
      status: "Low",
      gap,
      deficiency_percentage: percentage
    });
  }

  // pH
  if (soil.pH < standards.pH.min) {
    deficiencies.push({
      nutrient: "pH",
      status: "Acidic",
      issue: "Low"
    });
  } else if (soil.pH > standards.pH.max) {
    deficiencies.push({
      nutrient: "pH",
      status: "Alkaline",
      issue: "High"
    });
  }

  return deficiencies;
}

module.exports = calculateDeficiency;
