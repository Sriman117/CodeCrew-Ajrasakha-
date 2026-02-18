const { FERTILIZER_MAPPING, FERTILIZER_PRICES } = require("../config/constants");

function recommendFertilizer(deficiencies, farmSize = 1) {
  const recommendations = [];

  deficiencies.forEach(d => {
    let map;

    if (d.nutrient === "pH") {
      // Handle pH specifically if needed, or skip
      // For now, let's assume we want to treat low pH
      if (d.status === "Acidic") {
        map = FERTILIZER_MAPPING["pH_low"];
      } else {
        return;
      }
    } else {
      map = FERTILIZER_MAPPING[d.nutrient];
    }

    if (!map) return;

    // Calculate bags
    let bags = 1;
    if (d.gap) {
      bags = Math.ceil(
        (d.gap * farmSize) /
        (map.nutrientContent * map.bagWeight)
      );
    }

    if (isNaN(bags) || bags <= 0) bags = 1;

    const pricePerBag = FERTILIZER_PRICES[map.product];
    // console.log("Product:", map.product, "Price:", pricePerBag); // Debug

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
