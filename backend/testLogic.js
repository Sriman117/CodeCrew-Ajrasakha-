const interpret = require("./src/logic/interpretSoil");
const calc = require("./src/logic/calculateDeficiency");
const recommend = require("./src/logic/recommendFertilizer");

const soil = { N: 140, P: 12, K: 180, pH: 5.5 };
const crop = "wheat";

console.log(interpret(soil));
const deficiencies = calc(soil, crop);
console.log(deficiencies);
console.log(recommend(deficiencies, 1));
