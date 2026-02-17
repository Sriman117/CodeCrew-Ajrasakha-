require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const analysisRoutes = require("./src/routes/analysisRoutes");
const scanRoutes = require("./src/routes/scanRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const trendRoutes = require("./src/routes/trendRoutes");

const app = express();

/* ---------- DATABASE ---------- */
connectDB();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api", scanRoutes);                 // OCR scanning
app.use("/api", analysisRoutes);             // Soil analysis
app.use("/api/analytics", analyticsRoutes);  // Impact metrics
app.use("/api/trends", trendRoutes);         // Historical trends

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
