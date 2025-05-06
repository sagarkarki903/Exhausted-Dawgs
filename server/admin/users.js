const express = require('express');
const pool = require("../db.js");
const router = express.Router();
const checkAdmin = require("./checkAdmin.js"); // Use the middleware

//  GET all users (Admins only)
router.get('/', checkAdmin, async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, firstname, lastname, username, email, role, phone FROM users");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error while fetching users." });
    }
});


// UPDATE a user (Admins only)
router.put('/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { role, phone, firstname, lastname } = req.body;

  if (!role || !["Admin","Marshal","Walker"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided." });
  }

  try {
    // 1) update basic profile + role
    const [result] = await pool.query(
      `UPDATE users
          SET firstname = ?,
              lastname  = ?,
              phone     = ?,
              role      = ?
        WHERE id = ?`,
      [firstname, lastname, phone, role, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made." });
    }

    // 2) if demoted to Walker, clear any existing upgrade‐request state
    if (role === 'Walker') {
      await pool.query(
        `UPDATE users
            SET upgrade_status       = NULL,
                upgrade_reason       = NULL,
                upgrade_requested_at = NULL,
                upgrade_processed_at = NULL
          WHERE id = ?`,
        [id]
      );
    }

    // 3) fetch the fresh record (including upgrade_* columns)
    const [[user]] = await pool.query(
      `SELECT id, firstname, lastname, username, email, phone, role,
              upgrade_status, upgrade_reason,
              upgrade_requested_at, upgrade_processed_at
         FROM users
        WHERE id = ?`,
      [id]
    );

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user." });
  }
});

//  DELETE a user (Admins only)
router.delete('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;

    console.log(`🗑️ Delete Request for User ID: ${id}`);

    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log(" User deleted successfully.");
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error while deleting user." });
    }
});

module.exports = router;
