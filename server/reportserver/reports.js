const express = require("express");
const pool = require("../db.js"); // Import MySQL pool
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");

router.get("/admin/upcoming-walks", authenticateUser, async (req, res) => {
  const userRole = req.user?.role;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        ms.id AS session_id,
        ms.date,
        ms.time,
        CONCAT(mu.firstname, ' ', mu.lastname) AS marshal_name,
        CONCAT(wu.firstname, ' ', wu.lastname) AS walker_name
      FROM marshal_schedule ms
      JOIN users mu ON ms.created_by = mu.id
      LEFT JOIN walker_schedule ws ON ms.id = ws.schedule_id
      LEFT JOIN users wu ON ws.user_id = wu.id
      WHERE ms.date >= CURDATE()
      ORDER BY ms.date ASC, ms.time ASC;
    `);

    const sessions = {};
    rows.forEach(row => {
      if (!sessions[row.session_id]) {
        sessions[row.session_id] = {
          session_id: row.session_id,
          date: row.date,
          time: row.time,
          marshal_name: row.marshal_name,
          walkers: []
        };
      }

      if (row.walker_name) {
        sessions[row.session_id].walkers.push({
          walker_name: row.walker_name
          // dog_name is removed
        });
      }
    });

    res.json(Object.values(sessions));
  } catch (err) {
    console.error("Error fetching upcoming walks:", err);
    res.status(500).json({ message: "Failed to fetch upcoming walks" });
  }
});

router.get("/walker/my-walks", authenticateUser, async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (userRole !== "Walker") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        ms.id AS session_id,
        ms.date,
        ms.time,
        CONCAT(wu.firstname, ' ', wu.lastname) AS walker_name,
        CONCAT(mu.firstname, ' ', mu.lastname) AS marshal_name,
        ws.checked_in
      FROM marshal_schedule ms
      JOIN walker_schedule ws ON ms.id = ws.schedule_id
      JOIN users wu ON ws.user_id = wu.id
      JOIN users mu ON ms.created_by = mu.id
      WHERE ws.user_id = ?
      ORDER BY ms.date ASC, ms.time ASC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching walker's walks:", err);
    res.status(500).json({ message: "Failed to fetch walks" });
  }
});


router.get("/marshal/my-walks", authenticateUser, async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (userRole !== "Marshal") {
    return res.status(403).json({ message: "Only marshals can access this" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        ms.id AS session_id,
        ms.date,
        ms.time,
        CONCAT(mu.firstname, ' ', mu.lastname) AS marshal_name,
        CONCAT(wu.firstname, ' ', wu.lastname) AS walker_name
      FROM marshal_schedule ms
      JOIN users mu ON ms.created_by = mu.id
      LEFT JOIN walker_schedule ws ON ms.id = ws.schedule_id
      LEFT JOIN users wu ON ws.user_id = wu.id
      WHERE ms.created_by = ? AND ms.date >= CURDATE()
      ORDER BY ms.date ASC, ms.time ASC;
    `, [userId]);

    const sessions = {};
    rows.forEach(row => {
      if (!sessions[row.session_id]) {
        sessions[row.session_id] = {
          session_id: row.session_id,
          date: row.date,
          time: row.time,
          marshal_name: row.marshal_name,
          walkers: []
        };
      }

      if (row.walker_name) {
        sessions[row.session_id].walkers.push({
          walker_name: row.walker_name
          // dog_name removed
        });
      }
    });

    res.json(Object.values(sessions));
  } catch (err) {
    console.error("Error fetching marshal walks:", err);
    res.status(500).json({ message: "Failed to fetch marshal walks" });
  }
});



  // DELETE walk session (Admin or Marshal)
    router.delete("/delete-session/:id", authenticateUser, async (req, res) => {
        const sessionId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role;
    
        try {
        // For Marshals, allow deletion only of sessions they created
        const [rows] = await pool.query(
            `SELECT * FROM marshal_schedule WHERE id = ?`,
            [sessionId]
        );
    
        if (rows.length === 0) {
            return res.status(404).json({ message: "Session not found" });
        }
    
        const session = rows[0];
        if (userRole === "Marshal" && session.created_by !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this session" });
        }
    
        await pool.query(`DELETE FROM marshal_schedule WHERE id = ?`, [sessionId]);
    
        res.json({ message: "Session deleted successfully" });
        } catch (err) {
        console.error("Error deleting session:", err);
        res.status(500).json({ message: "Failed to delete session" });
        }
    });
  


    router.post("/complete-walk/:scheduleId", authenticateUser, async (req, res) => {
      const { scheduleId } = req.params;
    
      try {
        // 1. Get all session details along with check-in status
        const [rows] = await pool.query(`
          SELECT 
            ms.date,
            ms.time,
            CONCAT(wu.firstname, ' ', wu.lastname) AS walker,
            CONCAT(mu.firstname, ' ', mu.lastname) AS marshal,
            ws.checked_in
          FROM marshal_schedule ms
          JOIN walker_schedule ws ON ms.id = ws.schedule_id
          JOIN users wu ON ws.user_id = wu.id
          JOIN users mu ON ms.created_by = mu.id
          WHERE ms.id = ?
        `, [scheduleId]);
    
        if (rows.length === 0) {
          return res.status(404).json({ message: "Session not found or no walkers assigned." });
        }
    
        // 2. Insert into report_table (without dog column)
        const insertPromises = rows.map(row => {
          const status = row.checked_in ? "Checked In" : "Not Checked In";
          return pool.query(`
            INSERT INTO report_table (date, time, walker, marshal, status, check_in_status)
            VALUES (?, ?, ?, ?, 'Completed', ?)
          `, [row.date, row.time, row.walker, row.marshal, status]);
        });
    
        await Promise.all(insertPromises);
    
        // 3. Delete session (and related walker_schedule entries)
        await pool.query(`DELETE FROM marshal_schedule WHERE id = ?`, [scheduleId]);
    
        res.json({ message: "Walk marked as completed and session deleted." });
      } catch (err) {
        console.error("Error completing walk:", err);
        res.status(500).json({ message: "Failed to complete walk." });
      }
    });
    

// GET all reports (for Admin to see all completed walks)
router.get("/all", authenticateUser, async (req, res) => {
  const userRole = req.user?.role;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const [reports] = await pool.query(`
      SELECT date, time, walker, marshal, status, check_in_status
      FROM report_table
      ORDER BY date DESC, time DESC
    `);

    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

      
  
  

  module.exports = router;
