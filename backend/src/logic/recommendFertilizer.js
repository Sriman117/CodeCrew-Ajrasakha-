const mapping = require("../data/fertilizerMapping.json");
const prices = require("../data/fertilizerPrices.json");

function recommend(deficiencies, farmSize = 1) {
  let recommendations = [];
  let totalCost = 0;

  deficiencies.forEach(d => {
    const map = mapping[d.nutrient] || mapping["pH_low"];
    const bags = d.gap
      ? Math.ceil((d.gap * farmSize) / (map.nutrientContent * map.bagWeight))
      : 1;

    const cost = bags * prices[map.product];
    totalCost += cost;

    recommendations.push({
      product: map.product,
      bags,
      cost
    });
  });

  return { recommendations, totalCost };
}

module.exports = recommend;
