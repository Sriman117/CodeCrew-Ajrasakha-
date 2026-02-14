const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const analysisRoutes = require("./src/routes/analysisRoutes");
const scanRoutes = require("./src/routes/scanRoutes");

app.use("/api", analysisRoutes);
app.use("/api", scanRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Mitti-Scan backend running" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
