const pool = require("../database/db");

const registerUser = async (req, res) => {
  const { firebase_uid, full_name, email, phone, role } = req.body;

  // Simple validation check
  if (!firebase_uid || !email) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: firebase_uid and email are mandatory." 
    });
  }

  try {
    // Insert new operator/user into our cloud database
    const queryText = `
      INSERT INTO users (firebase_uid, full_name, email, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (firebase_uid) DO NOTHING
      RETURNING *;
    `;
    
    const values = [firebase_uid, full_name, email, phone, role || "operator"];
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "User already synchronized in database ledger."
      });
    }

    return res.status(201).json({
      success: true,
      message: "User successfully synchronized to database ledger.",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Registration Database Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error saving user metadata." 
    });
  }
};

module.exports = { registerUser };
// Fetch user metadata/role by Firebase UID
export const getUserByUid = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await db.query(
      "SELECT id, firebase_uid, full_name, email, role, created_at FROM users WHERE firebase_uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User profile not found in ledger." });
    }

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("❌ Profile Fetch Database Error:", error.message);
    res.status(500).json({ success: false, error: "Internal server error retrieving user profile." });
  }
};