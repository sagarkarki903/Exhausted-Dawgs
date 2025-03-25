const express = require("express");
const authenticateUser = require("./middleware/authMiddleware"); // Import middleware
const pool = require("./db"); // Import database

const router = express.Router();

// Protected Route to Get Authenticated User Data
router.get("/profile", authenticateUser, async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, firstname, lastname, username, email, created_at, role, phone FROM users WHERE id = ?",
            [req.user.id]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(users[0]); // Return user data
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Admin Update User Profile (Only Admins Can Change Role & Phone)
router.put("/update-user/:id", authenticateUser, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Only admins can update user details." });
    }

    const { id } = req.params;
    const { phone, role } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE users SET phone = ?, role = ? WHERE id = ?",
            [phone, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
