const jwt = require("jsonwebtoken");
require('dotenv').config();

const checkAdmin = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        // Verify token and extract user data
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT:", decoded); // Debugging log

        // Ensure user has an Admin role
        if (decoded.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        req.userId = decoded.id; // Attach user ID for further requests
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ message: "Invalid token or authentication failed." });
    }
};

module.exports = checkAdmin;