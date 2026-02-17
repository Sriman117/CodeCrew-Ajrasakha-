const ranges = require("../data/soilRanges.json");

function interpretSoil(soil) {
  const result = {};

  // Nitrogen
  if (soil.N < ranges.Nitrogen.low) result.N = "Low";
  else if (soil.N < ranges.Nitrogen.medium) result.N = "Medium";
  else result.N = "High";

  // Phosphorus
  if (soil.P < ranges.Phosphorus.low) result.P = "Low";
  else if (soil.P < ranges.Phosphorus.medium) result.P = "Medium";
  else result.P = "High";

  // Potassium
  if (soil.K < ranges.Potassium.low) result.K = "Low";
  else if (soil.K < ranges.Potassium.medium) result.K = "Medium";
  else result.K = "High";

  // Organic Carbon (OC)
  if (soil.OC !== undefined && soil.OC !== null) {
    if (soil.OC < ranges.OC.low) result.OC = "Low";
    else if (soil.OC < ranges.OC.medium) result.OC = "Medium";
    else result.OC = "High";
  }

  // pH
  if (soil.pH < ranges.pH.acidic) result.pH = "Acidic";
  else if (soil.pH > ranges.pH.alkaline) result.pH = "Alkaline";
  else result.pH = "Normal";

  return result;
}

module.exports = interpretSoil;
