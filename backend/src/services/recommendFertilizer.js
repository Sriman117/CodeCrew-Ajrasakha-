const { FERTILIZER_MAPPING, FERTILIZER_PRICES } = require("../config/constants");

function recommendFertilizer(deficiencies, farmSize = 1) {
  const recommendations = [];

  deficiencies.forEach(d => {
    let map;

    if (d.nutrient === "pH") {
      map = mapping["pH_low"];
    } else {
      map = mapping[d.nutrient];
    }

    if (!map) return;

    const bags = d.gap
      ? Math.ceil(
        (d.gap * farmSize) /
        (map.nutrientContent * map.bagWeight)
      )
      : 1;

    if (isNaN(bags) || bags <= 0) return;

    const pricePerBag = prices[map.product];
    if (!pricePerBag || isNaN(pricePerBag)) return;

    const cost = bags * pricePerBag;

    recommendations.push({
      product: map.product,
      bags,
      cost,
      buyLinks: map.buyLinks
    });
  });

  return recommendations;
}

module.exports = recommendFertilizer;
