const cropStandards = require("../data/cropStandards.json");

function calculateDeficiency(soil, crop) {
  const target = cropStandards[crop];
  const deficiencies = [];

  if (soil.N < target.targetN) {
    deficiencies.push({
      nutrient: "Nitrogen",
      gap: target.targetN - soil.N
    });
  }

  if (soil.P < target.targetP) {
    deficiencies.push({
      nutrient: "Phosphorus",
      gap: target.targetP - soil.P
    });
  }

  if (soil.K < target.targetK) {
    deficiencies.push({
      nutrient: "Potassium",
      gap: target.targetK - soil.K
    });
  }

  if (soil.pH < target.pH.min) {
    deficiencies.push({
      nutrient: "pH",
      issue: "Low"
    });
  }

  return deficiencies;
}

module.exports = calculateDeficiency;
