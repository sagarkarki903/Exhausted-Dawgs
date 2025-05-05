const express = require('express');
const pool = require("./db.js"); // Import MySQL pool
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret Key for JWT 
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; 

const COOKIE_OPTIONS = {
    httpOnly: true, // Prevents JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production",  
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Allows sending cookies within the same domain
};

//..............Sign up Start.......................................................................
router.post('/register', async (req, res) => {
    const { firstname, lastname, username, email, password, role } = req.body;

    if (!firstname || !lastname || !username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Validate the role (optional: only allow Admins to assign roles)
        const validRoles = ["Admin", "Marshal", "Walker"];
        const assignedRole = role && validRoles.includes(role) ? role : "Walker"; // Default to 'Walker' if not specified
        // Check if email already exists
        const [existingEmail] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ message: "Email already in use. Please use a different email." });
        }

        // Check if username already exists
        const [existingUsername] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUsername.length > 0) {
            return res.status(409).json({ message: "Username already taken. Please choose a different username." });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Request Body:", req.body);

        // Insert new user into the database
        await pool.query(
            "INSERT INTO users (firstname, lastname, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)", 
            [firstname, lastname, username, email, hashedPassword, assignedRole]
        );

        res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});
//..................Signup End.....................................................................


//...................Login Start ............................................

//  User Login Route
router.post('/login-server', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    // console.log(req.body)

    if (!emailOrUsername || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if user exists by email or username
        const [users] = await pool.query(
            "SELECT id, firstname, lastname, username, email, password, role FROM users WHERE email = ? OR username = ? LIMIT 1",
            [emailOrUsername, emailOrUsername]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const user = users[0]; // Get the first user from the result

        // Compare password with hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

         // Generate JWT Token (only store `id` to protect user data)
         const token = jwt.sign(
            { id: user.id, role: user.role }, // Only store user ID in token
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set the token as an HTTP-only cookie
        // res.cookie("auth_token", token, COOKIE_OPTIONS);
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",             // Optional but good for safety
            maxAge: 60 * 60 * 1000 // 1 hour
          });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                role: user.role
            },
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});


//...................Login End...............................................


//Logout...................................................
// Logout Route (Clear the Cookie)
router.post('/logout-server', (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
      });
    res.status(200).json({ message: "Logout successful." });
});
//logout end.......................................................

module.exports = router;
