
const express = require('express');
const pool = require("./db.js") //imports mysql pool
const router = express.Router();


// GET /dogs - Retrieve all dog records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dogs');
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving dogs:', err);
    res.status(500).json({ error: 'Error retrieving dogs' });
  }
});

// GET /dogs/:id - Retrieve a specific dog by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM dogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error retrieving dog:', err);
    res.status(500).json({ error: 'Error retrieving dog' });
  }
});

// POST /dogs - Create a new dog record
router.post('/', async (req, res) => {
  try {
    const { name, breed, size, healthIssues, status, demeanor, notes, imageUrl } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO dogs (name, breed, size, health_issues, status, demeanor, notes, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, breed, size, healthIssues, status, demeanor, notes, imageUrl]
    );
    res.status(201).json({ id: result.insertId, message: 'Dog created successfully' });
  } catch (err) {
    console.error('Error creating dog:', err);
    res.status(500).json({ error: 'Error creating dog' });
  }
});

// PUT /dogs/:id - Update an existing dog record
router.put('/:id', async (req, res) => {
  try {
    const { name, breed, size, healthIssues, status, demeanor, notes, imageUrl } = req.body;
    const [result] = await pool.query(
      `UPDATE dogs SET name = ?, breed = ?, size = ?, health_issues = ?, status = ?, demeanor = ?, notes = ?, image_url = ?
       WHERE id = ?`,
      [name, breed, size, healthIssues, status, demeanor, notes, imageUrl, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    
    res.json({ message: 'Dog updated successfully' });
  } catch (err) {
    console.error('Error updating dog:', err);
    res.status(500).json({ error: 'Error updating dog' });
  }
});

// DELETE /dogs/:id - Delete a dog record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM dogs WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    
    res.json({ message: 'Dog deleted successfully' });
  } catch (err) {
    console.error('Error deleting dog:', err);
    res.status(500).json({ error: 'Error deleting dog' });
  }
});

module.exports = router;
