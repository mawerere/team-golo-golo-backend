const express = require("express");
const router = express.Router();
const { registerUser, getUserByUid } = require("../controllers/authController");

// Path maps directly to POST /api/auth/register
router.post("/register", registerUser);

// Path maps directly to GET /api/auth/user/:uid for frontend guard checks
router.get("/user/:uid", getUserByUid);

module.exports = router;