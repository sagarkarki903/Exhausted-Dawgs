const express = require("express");
const authenticateUser = require("./middleware/authMiddleware"); // Import middleware
const pool = require("./db"); // Import database
const cloudinary = require('./config/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage before uploading to Cloudinary

const router = express.Router();

//testing...will b removed later
router.get("/test", (req, res) => {
    res.send("✅ Auth route is reachable!");
  });
  

// Protected Route to Get Authenticated User Data
router.get("/profile", authenticateUser, async (req, res) => {
    try {
        // console.log("/auth/profile route hit!")
        const [users] = await pool.query(
            "SELECT id, firstname, lastname, username, email, created_at, role, phone, profile_pic, favorite FROM users WHERE id = ?",
            [req.user.id]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(users[0]); // Return user data
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Helper function: Extract Cloudinary public_id from image URL
function getPublicIdFromUrl(url) {
  try {
    // Example URL:
    // https://res.cloudinary.com/your_cloud_name/image/upload/v1742961701/user_profiles/19/profile_19_1234567890.png
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let remainder = parts[1]; // e.g., "v1742961701/user_profiles/19/profile_19_1234567890.png"
    const segments = remainder.split('/');
    // Remove version segment if present (starts with "v")
    if (segments[0].startsWith('v')) {
      segments.shift();
    }
    const publicIdWithExt = segments.join('/'); // "user_profiles/19/profile_19_1234567890.png"
    const dotIndex = publicIdWithExt.lastIndexOf('.');
    if (dotIndex !== -1) {
      return publicIdWithExt.substring(0, dotIndex);
    }
    return publicIdWithExt;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

// POST /auth/profile/upload - Upload and replace user profile picture
router.post("/profile/upload", authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { path } = req.file;

    // Retrieve the current profile picture URL from the database
    const [users] = await pool.query("SELECT profile_pic FROM users WHERE id = ?", [userId]);
    
    // If an old profile picture exists, delete it from Cloudinary.
    if (users.length > 0 && users[0].profile_pic) {
      const oldUrl = users[0].profile_pic;
      const oldPublicId = getPublicIdFromUrl(oldUrl);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    // Upload the new image to Cloudinary in a user-specific folder.
    const result = await cloudinary.uploader.upload(path, {
      folder: `user_profiles/${userId}`,
      // You can generate a new public_id or let Cloudinary generate one automatically.
      public_id: `profile_${userId}_${Date.now()}`,
      overwrite: true
    });

    // Update the user's profile_pic column in the database with the new secure URL.
    await pool.query("UPDATE users SET profile_pic = ? WHERE id = ?", [result.secure_url, userId]);

    res.status(200).json({ message: "Profile picture updated successfully.", profile_pic: result.secure_url });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Failed to update profile picture." });
  }
});

// Admin Update User Profile (Only Admins Can Change Role & Phone)
router.put("/update-user/:id", authenticateUser, async (req, res) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Only admins can update user details." });
    }

    const { id } = req.params;
    const { phone, role } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE users SET phone = ?, role = ? WHERE id = ?",
            [phone, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Toggle favorite dog endpoint
router.put("/favorite", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dogId } = req.body;  // Expect the dog's id to be sent in the request body

    if (!dogId) {
      return res.status(400).json({ error: "dogId is required in the request body." });
    }

    // Fetch current favorites from the user record
    const [rows] = await pool.query("SELECT favorite FROM users WHERE id = ?", [userId]);
    let favorites = [];
    if (rows.length > 0 && rows[0].favorite) {
      try {
        favorites = JSON.parse(rows[0].favorite);
        if (!Array.isArray(favorites)) {
          favorites = [];
        }
      } catch (err) {
        favorites = [];
      }
    }

    // Toggle: add the dogId if it's not in favorites, otherwise remove it
    if (favorites.includes(dogId)) {
      favorites = favorites.filter((id) => id !== dogId);
    } else {
      favorites.push(dogId);
    }

    // Update the user's favorite column (stored as a JSON string)
    await pool.query("UPDATE users SET favorite = ? WHERE id = ?", [JSON.stringify(favorites), userId]);

    res.status(200).json({ message: "Favorite updated successfully.", favorites });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ error: "Failed to update favorites." });
  }
});


module.exports = router;
