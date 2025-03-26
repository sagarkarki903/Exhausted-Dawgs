const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateUser = require("../middleware/authMiddleware");




// GET all unique session dates
router.get("/sessions", async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT DISTINCT DATE(date) as date FROM marshal_schedule`
      );
  
      const dates = rows.map((row) => row.date);
      res.json(dates);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  


// GET detailed walk sessions for a specific date
router.get("/sessions/:date", async (req, res) => {
    const date = req.params.date;
  
    try {
      const [rows] = await pool.query(
        `SELECT 
          m.id,
          m.date,
          m.time,
          CONCAT(u.firstname, ' ', u.lastname) AS marshal_name,
          d.name AS dog_name,
          (
            SELECT COUNT(*) 
            FROM walker_schedule w 
            WHERE w.schedule_id = m.id
          ) AS walkers_booked
        FROM marshal_schedule m
        JOIN users u ON m.created_by = u.id
        JOIN dogs d ON m.dog_id = d.id
        WHERE DATE(m.date) = ?`,
        [date]
      );
  
      res.json(rows);
    } catch (error) {
      console.error("Error fetching session details:", error);
      res.status(500).json({ message: "Failed to fetch session details" });
    }
  });
  
// POST to open a new walk session
router.post("/add-session", authenticateUser, async (req, res) => {
    const { date, time, dog_id } = req.body;
  
    try {
      const userId = req.user?.id;
  
      if (!userId || !date || !time || !dog_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const [existing] = await pool.query(
        "SELECT * FROM marshal_schedule WHERE date = ? AND time = ? AND dog_id = ?",
        [date, time, dog_id]
      );
  
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: "This slot already exists for the selected dog." });
      }
  
      const [result] = await pool.query(
        `INSERT INTO marshal_schedule (date, time, dog_id, created_by)
         VALUES (?, ?, ?, ?)`,
        [date, time, dog_id, userId]
      );
  
      res.status(201).json({ message: "Walk session created", sessionId: result.insertId });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });
  

  // Get all closed dates
router.get("/closures", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT date FROM shelter_closures");
      res.json(rows.map(row => row.date));
    } catch (err) {
      console.error("Error fetching closures", err);
      res.status(500).json({ message: "Failed to fetch closures" });
    }
  });
  
// Add a closed date (only Admin)
router.post("/closures", authenticateUser, async (req, res) => {
    const { date } = req.body;
    const userRole = req.user?.role;
  
    if (userRole !== "Admin") {
      return res.status(403).json({ message: "Only admins can close a date" });
    }
  
    try {
      await pool.query("INSERT INTO shelter_closures (date) VALUES (?)", [date]);
      res.status(201).json({ message: "Date marked as closed" });
    } catch (err) {
      console.error("Error inserting closure", err);
      res.status(500).json({ message: "Failed to mark date as closed" });
    }
  });




module.exports = router;
