const parseSoilText = require('../src/utils/parseSoilText');

const testCases = [
    {
        name: "Simple Format",
        text: "Soil Health Card\nNitrogen: 140\nPhosphorus: 25\nPotassium: 300\npH: 7.2\nOrganic Carbon: 0.5",
        expected: { N: 140, P: 25, K: 300, pH: 7.2, OC: 0.5 }
    },
    {
        name: "Noisy OCR Format",
        text: "Mitti Parikshan Report ...\nAvail N - 240 kg\nP (P2O5) ... 18.5\nK (K2O) : 450\nSoil Reaction (pH) .. 6.5\nOrg. C - 0.75%",
        expected: { N: 240, P: 18.5, K: 450, pH: 6.5, OC: 0.75 }
    },
    {
        name: "Casing & Abbreviations",
        text: "n : 100\np : 10\nk : 100\nph : 7\noc : 0.4",
        expected: { N: 100, P: 10, K: 100, pH: 7, OC: 0.4 }
    }
];

console.log("Running OCR Logic Tests...\n");

testCases.forEach(test => {
    console.log(`Testing: ${test.name}`);
    const result = parseSoilText(test.text);

    let passed = true;
    Object.keys(test.expected).forEach(key => {
        if (result[key] !== test.expected[key]) {
            console.error(`  [FAIL] ${key}: Expected ${test.expected[key]}, got ${result[key]}`);
            passed = false;
        }
    });

    if (passed) console.log("  [PASS] All values matched.");
    console.log("--------------------------------------------------");
});
