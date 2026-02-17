function extractValue(text, keywords) {
  const regex = new RegExp(`(${keywords})[^0-9]*(\\d+\\.?\\d*)`, "i");
  const match = text.match(regex);
  return match ? Number(match[2]) : null;
}

function parseSoilText(text) {
  return {
    N: extractValue(text, "Nitrogen|\\bN\\b"),
    P: extractValue(text, "Phosphorus|\\bP\\b"),
    K: extractValue(text, "Potassium|\\bK\\b"),
    OC: extractValue(text, "Organic Carbon|OC"),
    pH: extractValue(text, "pH")
  };
}

module.exports = parseSoilText;
