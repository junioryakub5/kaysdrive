require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 4000;

// Stripe webhook needs raw body — must be before express.json()
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

// Regular JSON parsing for all other routes
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/stripe", require("./routes/stripe"));
app.use("/api/products", require("./routes/products"));
app.use("/api/newsletter", require("./routes/newsletter"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/obdpro")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 OBDPro backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    // Start server anyway so Stripe webhook and newsletter still work
    app.listen(PORT, () => {
      console.log(`⚠️  Server running without DB on http://localhost:${PORT}`);
    });
  });

module.exports = app;
