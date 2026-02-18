// Crop Standards
const CROP_STANDARDS = {
    wheat: {
        targetN: 300,
        targetP: 40,
        targetK: 300,
        pH: { min: 6.0, max: 7.5 }
    },
    rice: {
        targetN: 250,
        targetP: 30,
        targetK: 250,
        pH: { min: 5.5, "max": 7.0 }
    },
    cotton: {
        targetN: 275,
        targetP: 35,
        targetK: 275,
        pH: { min: 6.0, "max": 7.5 }
    }
};

// Soil Ranges
const SOIL_RANGES = {
    Nitrogen: {
        low: 280,
        medium: 560,
        unit: "kg/ha"
    },
    Phosphorus: {
        low: 10,
        medium: 25,
        unit: "kg/ha"
    },
    Potassium: {
        low: 110,
        medium: 280,
        unit: "kg/ha"
    },
    OC: {
        low: 0.5,
        medium: 0.75,
        unit: "%"
    },
    pH: {
        acidic: 6.0,
        alkaline: 7.5
    }
};

// Fertilizer Mapping
const FERTILIZER_MAPPING = {
    Nitrogen: {
        product: "Neem Coated Urea",
        nutrientContent: 0.46,
        bagWeight: 45,
        buyLinks: {
            google: "https://www.google.com/search?q=Neem+Coated+Urea+fertilizer+near+me",
            amazon: "https://www.amazon.in/s?k=Neem+Coated+Urea"
        }
    },
    Phosphorus: {
        product: "Single Super Phosphate",
        nutrientContent: 0.16,
        bagWeight: 50,
        buyLinks: {
            google: "https://www.google.com/search?q=Single+Super+Phosphate+fertilizer+near+me",
            amazon: "https://www.amazon.in/s?k=Single+Super+Phosphate"
        }
    },
    Potassium: {
        product: "Muriate of Potash",
        nutrientContent: 0.60,
        bagWeight: 50,
        buyLinks: {
            google: "https://www.google.com/search?q=Muriate+of+Potash+fertilizer+near+me",
            amazon: "https://www.amazon.in/s?k=Muriate+of+Potash"
        }
    },
    OC: {
        product: "Vermicompost",
        nutrientContent: 0.20,
        bagWeight: 50,
        buyLinks: {
            google: "https://www.google.com/search?q=Vermicompost+near+me",
            amazon: "https://www.amazon.in/s?k=Vermicompost"
        }
    },
    pH_low: {
        product: "Agricultural Lime",
        nutrientContent: 1,
        bagWeight: 50,
        buyLinks: {
            google: "https://www.google.com/search?q=Agricultural+Lime+near+me",
            amazon: "https://www.amazon.in/s?k=Agricultural+Lime"
        }
    }
};

// Fertilizer Prices
const FERTILIZER_PRICES = {
    "Neem Coated Urea": 266,
    "Single Super Phosphate": 350,
    "Muriate of Potash": 800,
    "Vermicompost": 400,
    "Agricultural Lime": 300
};

module.exports = {
    CROP_STANDARDS,
    SOIL_RANGES,
    FERTILIZER_MAPPING,
    FERTILIZER_PRICES
};
