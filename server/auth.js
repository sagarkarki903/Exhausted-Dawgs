const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

const router = express.Router();

// Secret Key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// GET /dogs - Retrieve all dog records
router.get('/', async (req, res) => {
  res.send('Hello, Auth!');
  }
);

router.get('/signup', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});


// SIGN-UP ROUTE
router.post('/signup', (req, res) => {

console.log("Received signup request body:", req.body); // Debugging log

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    // Insert into database
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (error, result) => {
      if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ message: 'Error creating user' });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});


// LOGIN ROUTE
router.post('/login', (req, res) => {

    console.log("Received login request body:", req.body); // Debugging logconsole.log("Received signup request body:", req.body); // Debugging log

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user exists
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];

    // Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Error checking password' });
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful', token });
    });
  });
});

module.exports = router;
