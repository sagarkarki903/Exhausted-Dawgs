const jwt = require("jsonwebtoken");
require('dotenv').config();

const checkAdmin = (req, res, next) => {
  // ✅ Get token from cookies
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  try {
    // ✅ Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Check for Admin role
    if (decoded.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // Attach full decoded payload if needed
    next(); // ✅ Proceed to the route
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid token or authentication failed." });
  }
};

module.exports = checkAdmin;
