require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// Force connection string if in production to prevent fallback bugs
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error connecting to PostgreSQL:", err.stack);
  }
  console.log("✅ Connected to PostgreSQL");
  release();
});

module.exports = pool;