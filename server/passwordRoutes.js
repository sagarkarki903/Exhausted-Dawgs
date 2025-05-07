const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pool = require("./db");
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND;

// 1) Request password reset link
// POST /auth/forgot-password
// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  // Look up user
  const [[user]] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (!user) {
    return res.status(404).json({ message: "That email address is not registered." });
  }

  // … generate token, save it, build resetUrl …
  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 3600 * 1000); // 1h
  await pool.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
    [token, expires, user.id]
  );

  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  res.json({
    message: "Password reset link generated.",
    resetUrl,
  });
});


// 2) Perform the reset
// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  // find user by token *and* still valid
  const [[user]] = await pool.query(
    `SELECT id, reset_token_expires AS expires 
       FROM users 
      WHERE reset_token = ?`, 
    [token]
  );
  if (
    !user ||
    !user.expires ||
    new Date(user.expires) < new Date()
  ) {
    return res.status(400).json({ message: "Token is invalid or expired" });
  }

  // hash new password
  const hash = await bcrypt.hash(newPassword, 10);

  // update
  await pool.query(
    `UPDATE users 
        SET password = ?, 
            reset_token = NULL, 
            reset_token_expires = NULL 
      WHERE id = ?`,
    [hash, user.id]
  );

  res.json({ message: "Password has been reset successfully" });
});

module.exports = router;
