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
router.get("/sessions/:date", authenticateUser, async (req, res) => {

  const date = req.params.date;
  const userId = req.user?.id || null;

  try {
    const [rows] = await pool.query(
      `SELECT 
        m.id,
        m.date,
        m.time,
        m.created_by,
        CONCAT(u.firstname, ' ', u.lastname) AS marshal_name,
        (
          SELECT COUNT(*) 
          FROM walker_schedule w 
          WHERE w.schedule_id = m.id
        ) AS walkers_booked,
        ${
          userId
            ? `(SELECT COUNT(*) > 0 FROM walker_schedule w WHERE w.schedule_id = m.id AND w.user_id = ${pool.escape(
                userId
              )}) AS user_booked`
            : `false AS user_booked`
        }
      FROM marshal_schedule m
      JOIN users u ON m.created_by = u.id
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
  const { date, time } = req.body;

  try {
    const userId = req.user?.id;

    if (!userId || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if this marshal/admin already has a session at the same time
    const [sameTimeSession] = await pool.query(
      "SELECT * FROM marshal_schedule WHERE date = ? AND time = ? AND created_by = ?",
      [date, time, userId]
    );

    if (sameTimeSession.length > 0) {
      return res.status(409).json({ message: "You already have a session at this time." });
    }

    // Insert the new session (no dog_id now)
    const [result] = await pool.query(
      `INSERT INTO marshal_schedule (date, time, created_by)
       VALUES (?, ?, ?)`,
      [date, time, userId]
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


  // DELETE a closed date (Only Admin)
router.delete("/closures/:date", authenticateUser, async (req, res) => {
  const { date } = req.params;
  const userRole = req.user?.role;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Only admins can open a date" });
  }

  try {
    const [result] = await pool.query("DELETE FROM shelter_closures WHERE date = ?", [date]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Date not found or already open" });
    }

    res.status(200).json({ message: "Date successfully reopened" });
  } catch (err) {
    console.error("Error opening date", err);
    res.status(500).json({ message: "Failed to open date" });
  }
});



router.post("/book-slot", authenticateUser, async (req, res) => {
  const { schedule_id } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // Only Walkers can book
  if (userRole !== "Walker") {
    return res.status(403).json({ message: "Only walkers can book sessions" });
  }

  if (!schedule_id || !userId) {
    return res.status(400).json({ message: "Missing schedule ID" });
  }
  
  try {
    // Get schedule details
    const [[session]] = await pool.query(
      "SELECT * FROM marshal_schedule WHERE id = ?",
      [schedule_id]
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user already booked this session
    const [existingBooking] = await pool.query(
      "SELECT * FROM walker_schedule WHERE schedule_id = ? AND user_id = ?",
      [schedule_id, userId]
    );

    if (existingBooking.length > 0) {
      return res.status(409).json({ message: "You have already booked this session" });
    }



    // Check current walker count
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM walker_schedule WHERE schedule_id = ?",
      [schedule_id]
    );

    if (count >= 4) {
      return res.status(409).json({ message: "This session is already full" });
    }

    // Check if the user already has a booking at the same date and time
      const [timeConflict] = await pool.query(
          `SELECT ws.* 
          FROM walker_schedule ws
          JOIN marshal_schedule ms ON ws.schedule_id = ms.id
          WHERE ms.date = ? AND ms.time = ? AND ws.user_id = ?`,
          [session.date, session.time, userId]
        );

        if (timeConflict.length > 0) {
          return res.status(409).json({ message: "You already have a session booked at this time." });
        }


    // Insert the booking
    await pool.query(
      "INSERT INTO walker_schedule (schedule_id, user_id) VALUES (?, ?)",
      [schedule_id, userId]
    );
    

    res.status(201).json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: "Failed to book slot" });
  }
});







module.exports = router;
