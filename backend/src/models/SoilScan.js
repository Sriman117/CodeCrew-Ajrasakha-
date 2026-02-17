const mongoose = require("mongoose");

const SoilScanSchema = new mongoose.Schema({
  soil: {
    N: Number,
    P: Number,
    K: Number,
    OC: Number,
    pH: Number
  },
  crop: String,
  farmSize: Number,
  interpretation: Object,
  deficiencies: Array,
  recommendations: Array,
  totalCost: Number,
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SoilScan", SoilScanSchema);
