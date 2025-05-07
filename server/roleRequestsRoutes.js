// roleRequestsRoutes.js
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

// 1) Walker → Request upgrade
// POST /role-requests
// body: { reason: string }
router.post(
  '/',
  authenticate,
  ensureAuth,
  async (req, res) => {
    const userId = req.user.id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please provide a reason for your upgrade request.' });
    }

    // Check for recent denial
    const [[userRow]] = await pool.query(
      `SELECT upgrade_status, upgrade_processed_at
         FROM users
        WHERE id = ?`,
      [userId]
    );
    if (
      userRow.upgrade_status === 'denied' &&
      new Date(userRow.upgrade_processed_at) > Date.now() - 7*24*60*60*1000
    ) {
      const retryAt = new Date(userRow.upgrade_processed_at);
      retryAt.setDate(retryAt.getDate() + 7); // add 7 days
      return res.status(429).json({
        error: `You were denied recently. You can apply again after ${retryAt.toLocaleDateString()}.`
      });
    }

    // Save the request
    await pool.query(
      `UPDATE users
         SET upgrade_status       = 'pending',
             upgrade_reason       = ?,
             upgrade_requested_at = NOW(),
             upgrade_processed_at = NULL
       WHERE id = ?`,
      [reason, userId]
    );

    const [[row]] = await pool.query(
      `SELECT upgrade_status   AS status,
              upgrade_reason   AS reason,
              upgrade_requested_at AS requested_at
         FROM users
        WHERE id = ?`,
      [userId]
    );
    res.json(row);
  }
);

// 2) Walker → See own request
// GET /role-requests/mine
router.get(
  '/mine',
  authenticate,
  ensureAuth,
  async (req, res) => {
    const userId = req.user.id;
    const [[row]] = await pool.query(
      `SELECT upgrade_status       AS status,
              upgrade_requested_at AS requested_at,
              upgrade_processed_at AS processed_at
         FROM users
        WHERE id = ?`,
      [userId]
    );
    res.json(row || {});
  }
);

// 3) Admin → List all pending
// GET /role-requests
router.get(
  '/',
  authenticate,
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const [rows] = await pool.query(
      `SELECT id, firstname, lastname, email,
                upgrade_reason       AS reason,
              upgrade_requested_at AS requested_at
         FROM users
        WHERE upgrade_status = 'pending'
        ORDER BY upgrade_requested_at DESC`
    );
    res.json(rows);
  }
);

// 4) Admin → Approve or Deny
// PUT /role-requests/:userId
// body: { action: "approve"|"deny" }
router.put(
  '/:userId',
  authenticate,
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const { action } = req.body;
    const { userId } = req.params;

    if (!['approve','deny'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (action === 'approve') {
      // elevate to Marshal
      await pool.query(
        `UPDATE users
           SET role                 = 'Marshal',
               upgrade_status       = 'approved',
               upgrade_processed_at = NOW()
         WHERE id = ?`,
        [userId]
      );
    } else {
      // deny
      await pool.query(
        `UPDATE users
           SET upgrade_status       = 'denied',
               upgrade_processed_at = NOW()
         WHERE id = ?`,
        [userId]
      );
    }

    const [[row]] = await pool.query(
      `SELECT id,
              firstname,
              lastname,
              email,
              role,
              upgrade_status    AS status,
              upgrade_processed_at AS processed_at
         FROM users
        WHERE id = ?`,
      [userId]
    );
    res.json(row);
  }
);

module.exports = router;
