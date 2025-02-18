const express = require('express');
const pool = require("./db.js");
const router = express.Router();
const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;  // ✅ Attach user ID to request
        req.role = decoded.role;  // ✅ Attach user role to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};

// ✅ Marshal creates a schedule slot
router.post('/', authenticateUser,async (req, res) => {
    if (req.role !== "Marshal") {
        return res.status(403).json({ message: "Access denied. Only Marshals can create schedules." });
    }

    const { date, time_slot } = req.body;
    const marshalId = req.userId; // Extracted from JWT token

    try {
        await pool.query(
            "INSERT INTO schedule (date, time_slot, marshal_id) VALUES (?, ?, ?)",
            [date, time_slot, marshalId]
        );
        res.json({ message: "Schedule slot created successfully." });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ✅ Fetch available slots
router.get('/', async (req, res) => {
    try {
        const [slots] = await pool.query(
            "SELECT * FROM schedule"
        );
        res.json(slots);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.get("/user", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await pool.query(
            "SELECT id, firstname, lastname, username, email, role FROM users WHERE id = ?",
            [decoded.id]
        );

        if (!users.length) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json(users[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error." });
    }
});


// ✅ Walker books an appointment
router.post('/appointments', async (req, res) => {
    const { schedule_id, walker_id, dog_name } = req.body;

    try {
        const [count] = await pool.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE schedule_id = ?",
            [schedule_id]
        );

        if (count[0].count >= 4) {
            return res.status(400).json({ message: "No available slots for this time." });
        }

        await pool.query(
            "INSERT INTO appointments (schedule_id, walker_id, dog_name) VALUES (?, ?, ?)",
            [schedule_id, walker_id, dog_name]
        );

        res.json({ message: "Appointment booked successfully." });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
