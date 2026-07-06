require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./database/db");
const authRoutes = require("./routes/authRoutes"); // Added auth routing folder link

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json()); // Essential body parser for reading incoming JSON inputs

// Base Root Route / Health Check
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "🚀 Team GOLO GOLO Backend is Running smoothly",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("❌ Root route database validation error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Mounted Functional API Routes
app.use("/api/auth", authRoutes);

// Server Instantiation Port Configuration
// Always use web specific ports (like 10000) for fallbacks, avoiding database socket ranges (5432)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});