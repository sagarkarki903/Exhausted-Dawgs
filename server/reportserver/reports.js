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
        ws.user_id AS walker_id,
        ws.checked_in,
        CONCAT(mu.firstname, ' ', mu.lastname) AS marshal_name,
        CONCAT(wu.firstname, ' ', wu.lastname) AS walker_name,
        GROUP_CONCAT(d.name SEPARATOR ', ') AS dog_names
      FROM marshal_schedule ms
      JOIN users mu ON ms.created_by = mu.id
      LEFT JOIN walker_schedule ws ON ms.id = ws.schedule_id
      LEFT JOIN users wu ON ws.user_id = wu.id
      LEFT JOIN walker_dogs wd ON ws.schedule_id = wd.schedule_id AND ws.user_id = wd.walker_id
      LEFT JOIN dogs d ON wd.dog_id = d.id
      WHERE ms.date >= CURDATE()
      GROUP BY ms.id, ws.user_id
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
          walker_name: row.walker_name,
          walker_id: row.walker_id,
          checked_in: row.checked_in,
          dog_names: row.dog_names || null // null if no dogs assigned
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
        ws.checked_in,
        GROUP_CONCAT(d.name SEPARATOR ', ') AS dog_names
      FROM marshal_schedule ms
      JOIN walker_schedule ws ON ms.id = ws.schedule_id
      JOIN users wu ON ws.user_id = wu.id
      JOIN users mu ON ms.created_by = mu.id
      LEFT JOIN walker_dogs wd ON ws.schedule_id = wd.schedule_id AND ws.user_id = wd.walker_id
      LEFT JOIN dogs d ON wd.dog_id = d.id
      WHERE ws.user_id = ?
      GROUP BY ms.id
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
        ws.user_id AS walker_id,
        ws.checked_in,
        CONCAT(mu.firstname, ' ', mu.lastname) AS marshal_name,
        CONCAT(wu.firstname, ' ', wu.lastname) AS walker_name,
        GROUP_CONCAT(DISTINCT d.name ORDER BY d.name SEPARATOR ', ') AS dog_names
      FROM marshal_schedule ms
      JOIN users mu ON ms.created_by = mu.id
      LEFT JOIN walker_schedule ws ON ms.id = ws.schedule_id
      LEFT JOIN users wu ON ws.user_id = wu.id
      LEFT JOIN walker_dogs wd ON ws.schedule_id = wd.schedule_id AND ws.user_id = wd.walker_id
      LEFT JOIN dogs d ON wd.dog_id = d.id
      WHERE ms.created_by = ? AND ms.date >= CURDATE()
      GROUP BY ms.id, ws.user_id, ws.checked_in, wu.firstname, wu.lastname
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

      if (row.walker_id) {
        sessions[row.session_id].walkers.push({
          walker_name: row.walker_name,
          walker_id: row.walker_id,
          checked_in: row.checked_in,
          dog_names: row.dog_names || null
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
        // 1. Fetch all walkers in the session, with optional dog assignments
        const [rows] = await pool.query(`
          SELECT 
            ms.date,
            ms.time,
            CONCAT(wu.firstname, ' ', wu.lastname) AS walker,
            CONCAT(mu.firstname, ' ', mu.lastname) AS marshal,
            ws.checked_in,
            d.id AS dog_id,
            d.name AS dog_name
          FROM walker_schedule ws
          JOIN marshal_schedule ms ON ws.schedule_id = ms.id
          JOIN users wu ON ws.user_id = wu.id
          JOIN users mu ON ms.created_by = mu.id
          LEFT JOIN walker_dogs wd ON ws.schedule_id = wd.schedule_id AND ws.user_id = wd.walker_id
          LEFT JOIN dogs d ON wd.dog_id = d.id
          WHERE ws.schedule_id = ?
        `, [scheduleId]);
    
        if (rows.length === 0) {
          return res.status(404).json({ message: "No walkers or dog assignments found for this session." });
        }
    
        // 2. Insert report entry for each dog-walker pair (even if dog is null)
        const insertPromises = rows.map(row => {
          const checkInStatus = row.checked_in ? "Checked In" : "Not Checked In";
          return pool.query(`
            INSERT INTO report_table (date, time, walker, marshal, dog_id, dog_name, check_in_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            row.date,
            row.time,
            row.walker,
            row.marshal,
            row.dog_id || null,
            row.dog_name || null,
            checkInStatus
          ]);
        });
    
        await Promise.all(insertPromises);
    
        // 3. Delete the session
        await pool.query(`DELETE FROM marshal_schedule WHERE id = ?`, [scheduleId]);
    
        res.json({ message: "Walk completed and report created, including walkers without dogs." });
      } catch (err) {
        console.error("Error completing walk:", err);
        res.status(500).json({ message: "Failed to complete walk." });
      }
    });
    

    router.get("/all", authenticateUser, async (req, res) => {
      const userRole = req.user?.role;
    
      if (userRole !== "Admin") {
        return res.status(403).json({ message: "Access denied" });
      }
    
      try {
        const [reports] = await pool.query(`
          SELECT 
            id, -- ✅ add this line to include the report ID
            date,
            time,
            walker,
            marshal,
            dog_name,
            check_in_status
          FROM report_table
          ORDER BY date DESC, time DESC
        `);
    
        res.json(reports);
      } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ message: "Failed to fetch reports" });
      }
    });
    


      

// In reports.js or your route file
router.put("/check-in", authenticateUser, async (req, res) => {
  const { walkerId, sessionId } = req.body;
  const userRole = req.user?.role;

  if (!["Admin", "Marshal"].includes(userRole)) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!walkerId || !sessionId) {
    return res.status(400).json({ message: "Missing walkerId or sessionId" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE walker_schedule 
       SET checked_in = 1 
       WHERE user_id = ? AND schedule_id = ?`,
      [walkerId, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No matching walker session found." });
    }

    res.json({ message: "Walker checked in successfully." });
  } catch (err) {
    console.error("Error checking in walker:", err);
    res.status(500).json({ message: "Failed to check in walker." });
  }
});



//for walker_dogs, to assign each dogs to each walkers
router.post("/assign-dogs", authenticateUser, async (req, res) => {
  const { schedule_id, walker_id, dog_ids } = req.body;
  const userRole = req.user?.role;

  // Only Admins or Marshals can assign dogs
  if (!["Admin", "Marshal"].includes(userRole)) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!schedule_id || !walker_id || !Array.isArray(dog_ids) || dog_ids.length === 0) {
    return res.status(400).json({ message: "Missing or invalid data" });
  }

  try {
    // Insert new dog assignments, skip if already assigned
    const values = dog_ids.map((dog_id) => [schedule_id, walker_id, dog_id]);

    await pool.query(
      `INSERT IGNORE INTO walker_dogs (schedule_id, walker_id, dog_id) VALUES ?`,
      [values]
    );

    res.json({ message: "Dogs assigned successfully" });
  } catch (err) {
    console.error("Error assigning dogs:", err);
    res.status(500).json({ message: "Failed to assign dogs" });
  }
});


router.put("/undo-check-in", authenticateUser, async (req, res) => {
  const { walkerId, sessionId } = req.body;
  const userRole = req.user?.role;

  if (!["Admin", "Marshal"].includes(userRole)) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!walkerId || !sessionId) {
    return res.status(400).json({ message: "Missing walkerId or sessionId" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE walker_schedule 
       SET checked_in = 0 
       WHERE user_id = ? AND schedule_id = ?`,
      [walkerId, sessionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No matching walker session found." });
    }

    res.json({ message: "Check-in undone." });
  } catch (err) {
    console.error("Error undoing check-in:", err);
    res.status(500).json({ message: "Failed to undo check-in." });
  }
});

  
 
// for deleting from report table
router.delete("/:id", authenticateUser, async (req, res) => {
  const userRole = req.user?.role;
  const reportId = req.params.id;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Only Admins can delete reports" });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM report_table WHERE id = ?`,
      [reportId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ message: "Failed to delete report" });
  }
});

router.delete("/", authenticateUser, async (req, res) => {
  const userRole = req.user?.role;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Only Admins can delete all reports" });
  }

  try {
    const [result] = await pool.query(`DELETE FROM report_table`);
    res.json({ message: `Deleted ${result.affectedRows} report(s)` });
  } catch (err) {
    console.error("Error deleting all reports:", err);
    res.status(500).json({ message: "Failed to delete all reports" });
  }
});

  module.exports = router;
