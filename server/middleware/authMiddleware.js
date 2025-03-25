const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; 

const authenticateUser = (req, res, next) => {
    const token = req.cookies.auth_token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach user data to request
        next(); // Continue to the next middleware
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

module.exports = authenticateUser;
