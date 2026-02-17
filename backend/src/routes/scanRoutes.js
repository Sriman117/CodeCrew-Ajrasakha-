const express = require("express");
const multer = require("multer");
const path = require("path");

const { extractTextFromImage } = require("../services/ocrService");
const parseSoilText = require("../utils/parseSoilText");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

router.post("/scan", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = path.resolve(req.file.path);

    const text = await extractTextFromImage(imagePath);

    const soilData = parseSoilText(text);

    res.json({ soilData, rawText: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

module.exports = router;
