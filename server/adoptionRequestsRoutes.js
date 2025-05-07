// server/adoptionRequestsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('./db');
const authenticate = require('./middleware/authMiddleware');

// — helpers —
function ensureAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });
  next();
}
function ensureAdmin(req, res, next) {
  if (req.user.role !== 'Admin')
    return res.status(403).json({ error: 'Admin only' });
  next();
}

// 1) Walker → Request adoption
// POST /adoption-requests
// body: { dogId }
router.post(
  '/',
  authenticate,
  ensureAuth,
  async (req, res) => {
    const userId = req.user.id;
    const { dogId } = req.body;
    if (!dogId) return res.status(400).json({ error: 'Dog ID required' });

    // cooldown: last denied within 7 days?
    const [[last]] = await pool.query(
      `SELECT status, processed_at
         FROM adoption_requests
        WHERE user_id = ? AND dog_id = ?
        ORDER BY processed_at DESC
        LIMIT 1`,
      [userId, dogId]
    );
    if (
      last?.status === 'denied' &&
      new Date(last.processed_at) > Date.now() - 7 * 24 * 3600 * 1000
    ) {
      const retry = new Date(last.processed_at);
      retry.setDate(retry.getDate() + 7);
      return res.status(429).json({
        error: `Denied recently. Reapply after ${retry.toLocaleDateString()}`
      });
    }

    // insert new request
    const [{ insertId }] = await pool.query(
      `INSERT INTO adoption_requests
          (user_id, dog_id, status, requested_at)
       VALUES (?,       ?,      'pending', NOW())`,
      [userId, dogId]
    );
    // mark dog table as “Pending”
    await pool.query(
      `UPDATE dogs
          SET status = 'Pending'
        WHERE id = ?`,
      [dogId]
    );
    const [[reqRow]] = await pool.query(
      `SELECT ar.id, ar.status, ar.requested_at,
              d.name AS dog_name
         FROM adoption_requests ar
         JOIN dogs d ON d.id = ar.dog_id
        WHERE ar.id = ?`,
      [insertId]
    );
    res.json(reqRow);
  }
);

// 2) Walker → List own
// GET /adoption-requests/mine
router.get(
  '/mine',
  authenticate,
  ensureAuth,
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT ar.id, ar.dog_id, d.name AS dog_name,
              ar.status,
              ar.requested_at,
              ar.processed_at
         FROM adoption_requests ar
         JOIN dogs d ON d.id = ar.dog_id
        WHERE ar.user_id = ?
        ORDER BY ar.requested_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  }
);

// 3) Admin → List all
// GET /adoption-requests
router.get(
  '/',
  authenticate,
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT ar.id,
              ar.user_id,
              u.firstname, u.lastname, u.email,
              ar.dog_id, d.name AS dog_name,
              ar.status,
              ar.requested_at,
              ar.processed_at
         FROM adoption_requests ar
         JOIN users u ON u.id = ar.user_id
         JOIN dogs d  ON d.id = ar.dog_id
          WHERE ar.status = 'pending'
        ORDER BY ar.requested_at DESC`
    );
    res.json(rows);
  }
);

// 4) Admin → Approve or Deny
// PUT /adoption-requests/:id
// body: { action: "approve"|"deny" }
router.put(
  '/:id',
  authenticate,
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const { action } = req.body;
    const { id }     = req.params;

    // only allow "approve" or "deny" here
    if (!['approve','deny'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // map to your DB statuses
    const newStatus = action === 'approve' ? 'approved' : 'denied';

    // update request row
    await pool.query(
      `UPDATE adoption_requests
          SET status       = ?,
              processed_at = NOW()
        WHERE id = ?`,
      [newStatus, id]
    );

    // update the dog’s status accordingly
    const dogStatus = action === 'approve' ? 'Adopted' : 'Available';
    const [[{ dog_id }]] = await pool.query(
      `SELECT dog_id FROM adoption_requests WHERE id = ?`,
      [id]
    );
    await pool.query(
      `UPDATE dogs
          SET status = ?
        WHERE id = ?`,
      [dogStatus, dog_id]
    );

    // return the updated request
    const [[row]] = await pool.query(
      `SELECT id, status, requested_at, processed_at
         FROM adoption_requests
        WHERE id = ?`,
      [id]
    );
    res.json(row);
  }
);

module.exports = router;
