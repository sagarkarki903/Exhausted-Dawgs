const express = require("express");
const pool = require("../db.js"); // Import MySQL pool
const router = express.Router();

// ✅ Route to get all schedules for Marshal Report
router.get("/marshal-reports", async (req, res) => {
    try {
        const [schedules] = await pool.query(`
            SELECT 
                schedule.id, 
                schedule.date, 
                schedule.start_time, 
                schedule.end_time, 
                users.firstname AS marshal_firstname, 
                users.lastname AS marshal_lastname
            FROM schedule
            JOIN users ON schedule.marshal_id = users.id
            ORDER BY schedule.date DESC, schedule.start_time ASC
        `);

        res.json(schedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ✅ Route to get all appointments for Walker Report
router.get("/walker-reports", async (req, res) => {
    try {
        const [appointments] = await pool.query(`
            SELECT 
                appointments.id, 
                appointments.schedule_id, 
                appointments.dog_name, 
                appointments.start_time, 
                appointments.end_time, 
                users.firstname AS walker_firstname, 
                users.lastname AS walker_lastname
            FROM appointments
            JOIN users ON appointments.walker_id = users.id
            ORDER BY appointments.schedule_id DESC, appointments.start_time ASC
        `);

        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
