const express = require("express");
const pool = require("./db"); // MySQL promise pool
const router = express.Router();
const cloudinary = require("./config/cloudinary");
const authenticateUser = require("./middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage

// Create gallery table if it doesn't exist
const createGalleryTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Gallery table created or already exists");
  } catch (error) {
    console.error("Error creating gallery table:", error);
  }
};

// Initialize the table
createGalleryTable();

// Helper function: Extract Cloudinary public_id from an image URL
function getPublicIdFromUrl(url) {
  try {
    // Example URL:
    // https://res.cloudinary.com/your_cloud_name/image/upload/v1742961701/Gallery/1616141616141.png
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let remainder = parts[1]; // e.g., "v1742961701/Gallery/1616141616141.png"
    const segments = remainder.split("/");
    // Remove version segment if present (starts with "v")
    if (segments[0].startsWith("v")) {
      segments.shift();
    }
    const publicIdWithExt = segments.join("/"); // e.g., "Gallery/1616141616141.png"
    const dotIndex = publicIdWithExt.lastIndexOf(".");
    if (dotIndex !== -1) {
      return publicIdWithExt.substring(0, dotIndex);
    }
    return publicIdWithExt;
  } catch (err) {
    console.error("Error extracting public id from URL:", err);
    return null;
  }
}

// POST /gallery/upload - Upload an image to Cloudinary under the "Gallery" folder
router.post("/upload", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    // Allow only Admins and Marshals to upload
    if (req.user.role !== "Admin" && req.user.role !== "Marshal") {
      return res.status(403).json({ error: "Access denied." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const { path } = req.file;
    // Upload to Cloudinary under folder "Gallery"
    const result = await cloudinary.uploader.upload(path, {
      folder: "Gallery",
      public_id: `${Date.now()}`,
    });

    // Insert the image URL into the gallery table
    await pool.query("INSERT INTO gallery (image_url) VALUES (?)", [result.secure_url]);

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// GET /gallery - Retrieve all gallery images sorted by newest first
router.get("/", async (req, res) => {
  try {
    // Ensure that the images come sorted descending by upload time (newest first)
    console.log("Fetching gallery images...");
    const [images] = await pool.query("SELECT * FROM gallery ORDER BY uploaded_at DESC");
    console.log("Gallery images:", images);
    res.status(200).json(images);
  } catch (error) {
    console.error("Error retrieving gallery images:", error);
    res.status(500).json({ error: "Failed to retrieve gallery images" });
  }
});

// DELETE /gallery/:id - Delete a specific gallery image
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    // Allow only Admins and Marshals to delete images
    if (req.user.role !== "Admin" && req.user.role !== "Marshal") {
      return res.status(403).json({ error: "Access denied." });
    }
    const galleryId = req.params.id;
    // Retrieve the gallery image record
    const [rows] = await pool.query("SELECT image_url FROM gallery WHERE id = ?", [galleryId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Gallery image not found." });
    }
    const imageUrl = rows[0].image_url;
    // Extract Cloudinary public_id from the image URL
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return res.status(500).json({ error: "Could not determine public id from URL" });
    }
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    // Delete the record from the database
    await pool.query("DELETE FROM gallery WHERE id = ?", [galleryId]);

    res.status(200).json({ message: "Gallery image deleted successfully." });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
});

module.exports = router;
