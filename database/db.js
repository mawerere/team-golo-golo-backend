require("dotenv").config();

const { Pool } = require("pg");

// Check if the server is running in a production environment (cloud)
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Enforce SSL encryption in the cloud, but keep it disabled on your local machine
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