const express = require("express");
const multer = require("multer");


const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

const scanController = require("../controllers/scanController");

router.post("/scan", upload.single("image"), scanController.scanSoilCard);

module.exports = router;
