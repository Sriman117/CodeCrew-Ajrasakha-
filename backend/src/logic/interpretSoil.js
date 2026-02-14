const ranges = require("../data/soilRanges.json");

function interpretSoil(soil) {
  const result = {};

  if (soil.N < ranges.Nitrogen.low) result.N = "Low";
  else if (soil.N < ranges.Nitrogen.medium) result.N = "Medium";
  else result.N = "High";

  if (soil.P < ranges.Phosphorus.low) result.P = "Low";
  else if (soil.P < ranges.Phosphorus.medium) result.P = "Medium";
  else result.P = "High";

  if (soil.K < ranges.Potassium.low) result.K = "Low";
  else if (soil.K < ranges.Potassium.medium) result.K = "Medium";
  else result.K = "High";

  if (soil.pH < ranges.pH.acidic) result.pH = "Acidic";
  else if (soil.pH > ranges.pH.alkaline) result.pH = "Alkaline";
  else result.pH = "Normal";

  return result;
}

module.exports = interpretSoil;
