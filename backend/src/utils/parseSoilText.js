/**
 * Helper to extract a numeric value associated with a set of keywords.
 * Handles extensive variations in OCR output including:
 * - "Nitrogen : 123"
 * - "N - 123 kg/ha"
 * - "Available N 123"
 * - "N... 123"
 */
function extractValue(text, keywordsArray) {
  // Join keywords with | for regex OR
  const keywordPattern = keywordsArray.join("|");

  // Regex Explanation:
  // 1. (${keywordPattern})  -> Match any of the keywords (case-insensitive)
  // 2. [^0-9\n]*             -> Match any non-digit/non-newline chars (separators like : - . space)
  // 3. (\d+(\.\d+)?)         -> Capture the number (integer or decimal)
  const regex = new RegExp(`(${keywordPattern})[^0-9\\n]*(\\d+(\\.\\d+)?)`, "i");

  const match = text.match(regex);
  return match ? Number(match[2]) : null;
}

/**
 * Parses raw OCR text to extract soil nutrient values.
 * @param {string} text - The raw text from OCR.
 * @returns {Object} - Object containing N, P, K, pH, OC values.
 */
function parseSoilText(text) {
  // 1. Pre-processing: Clean up common OCR noise
  // Replace pipes, underscores, and multiple spaces which confuse regex
  const cleanText = text
    .replace(/[|_~]/g, " ")
    .replace(/P2O5/gi, "P") // Normalize chemical formulas
    .replace(/K2O/gi, "K")
    .replace(/\s+/g, " ");

  return {
    // Nitrogen: N, Available N, Nitrogen(N), etc.
    // \b ensures we don't match "Nitrogen" when looking for "N" inside other words
    N: extractValue(cleanText, ["Nitrogen", "Available Nitrogen", "\\bN\\b", "NO3", "NH4"]),

    // Phosphorus: P, Avail P, P2O5
    P: extractValue(cleanText, ["Phosphorus", "Available Phosphorus", "\\bP\\b", "P2O5"]),

    // Potassium: K, Avail K, K2O
    K: extractValue(cleanText, ["Potassium", "Available Potassium", "\\bK\\b", "K2O", "Potash"]),

    // Organic Carbon: OC, Org C, Organic C
    OC: extractValue(cleanText, ["Organic Carbon", "Org\\.?\\s*C", "\\bOC\\b", "Carbon"]),

    // pH: pH, Soil Reaction
    pH: extractValue(cleanText, ["\\bpH\\b", "Soil Reaction", "Reaction"])
  };
}

module.exports = parseSoilText;
