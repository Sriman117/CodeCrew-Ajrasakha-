const express = require("express");
const router = express.Router();

router.post("/scan", (req, res) => {
  res.json({
    message: "OCR scan stub",
    soilData: { N: 140, P: 12, K: 180, pH: 5.5 }
  });
});

module.exports = router;
