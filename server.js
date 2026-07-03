require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const pool = require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'golo_golo_ultra_secure_fallback_secret_key';

// ==========================================
// SECURITY: ANTI BRUTE-FORCE RATE LIMITER
// ==========================================
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many login attempts from this device. Access locked for 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// ROOT CHECK ROUTE
// ==========================================
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "🚀 Team GOLO golo Backend is Running",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==========================================
// UNIFIED SECURE SMART LOGIN ROUTE
// ==========================================
app.post("/api/auth/login", loginRateLimiter, async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Identification phone number and password are required.' });
  }

  try {
    // 1. Look up user profile directly in PostgreSQL using your pg pool
    const userQuery = await pool.query("SELECT * FROM users WHERE phone = $1", [phone.trim()]);
    const user = userQuery.rows[0];

    // 2. Fail silently if user doesn't exist or is blocked to preserve security boundaries
    if (!user || user.is_blocked) {
      return res.status(401).json({ error: 'Invalid identification metrics or password signature.' });
    }

    // 3. Securely compare password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid identification metrics or password signature.' });
    }

    // 4. Generate the Cryptographic Identity JWT Token with embedded database role
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, // Assumes column name 'role' exists (e.g. 'USER' or 'ADMIN')
        fullName: user.full_name 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. Send payload back. The frontend reads the role parameter to auto-route securely.
    return res.json({
      success: true,
      message: `Authentication complete. Welcome back ${user.full_name || 'User'}`,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
        role: user.role // Frontend reads this ('USER' vs 'ADMIN') to execute Smart Routing
      }
    });

  } catch (error) {
    console.error('Core Login Handshake Error:', error);
    return res.status(500).json({ error: 'An unexpected internal processing error occurred.' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});