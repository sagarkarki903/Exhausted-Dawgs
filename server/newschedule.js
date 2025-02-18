const express = require('express');
const pool = require("./db.js"); // Import MySQL pool
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to authenticate user from HTTP-only Cookie
const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies.auth_token; // Get token from cookies
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;  // Attach user ID to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};

// ✅ Route to fetch logged-in user data
router.get("/me", authenticateUser, async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, firstname, lastname, username, email, role FROM users WHERE id = ?",
            [req.userId]
        );

        if (!users.length) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json(users[0]); // Send user data
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error." });
    }
});

//Route to add appointment
router.post("/schedule", authenticateUser, async (req, res) => {
    const { date, start_time, end_time } = req.body;
    const marshal_id = req.userId; // Extract user ID from JWT token

    if (!date || !start_time || !end_time) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await pool.query(
            "INSERT INTO schedule (marshal_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
            [marshal_id, date, start_time, end_time]
        );

        res.status(201).json({ message: "Schedule added successfully!" });
    } catch (error) {
        console.error("Error adding schedule:", error);
        res.status(500).json({ message: "Server error." });
    }
});


//this is to get all the users from the database, not just the one who is logged in. That one is get by /me which is up here
router.get("/all-users", async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT firstname, lastname FROM users"
        );

        if (!users.length) {
            return res.status(404).json({ message: "No users found." });
        }

        res.json(users); // Return all users
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error." });
    }
});

//this gets all the appointments booked from the "schedule" table
router.get("/all-schedules", async (req, res) => {
    try {
        const [schedules] = await pool.query(
            `SELECT 
                schedule.id, 
                schedule.date, 
                schedule.start_time, 
                schedule.end_time, 
                users.firstname, 
                users.lastname,
                (SELECT COUNT(*) FROM appointments WHERE schedule_id = schedule.id) AS walker_count
            FROM schedule 
            JOIN users ON schedule.marshal_id = users.id
            ORDER BY schedule.date DESC, schedule.start_time DESC`
        );

        res.json(schedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ message: "Server error." });
    }
});



// Route for walkers to book an appointment
// Route for walkers to book an appointment (Max 4 walkers per slot)
router.post("/book-walker", authenticateUser, async (req, res) => {
    const { schedule_id, dog_name, start_time, end_time } = req.body;
    const walker_id = req.userId; // Logged-in user ID

    if (!schedule_id || !dog_name || !start_time || !end_time) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // ✅ 1. Count existing appointments for this schedule_id
        const [existingAppointments] = await pool.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE schedule_id = ?",
            [schedule_id]
        );

        if (existingAppointments[0].count >= 4) {
            return res.status(400).json({ message: "Appointment full! No more walkers can book this slot." });
        }

        // ✅ 2. Insert the new appointment if slot is available
        await pool.query(
            "INSERT INTO appointments (schedule_id, walker_id, dog_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
            [schedule_id, walker_id, dog_name, start_time, end_time]
        );

        res.status(201).json({ message: "Appointment booked successfully!" });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Server error." });
    }
});




module.exports = router;
