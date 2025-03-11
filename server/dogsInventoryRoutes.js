
const express = require('express');
const multer = require("multer");
const pool = require("./db.js") //imports mysql pool
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Create directory for storing images if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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
    const { name, breed, size, age, healthIssues, status, demeanor, notes, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || age === undefined) {
      return res.status(400).json({ error: 'Name and Age is required' });
    }

    //ensure age is int 
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0) {
      return res.status(400).json({ error: 'Age must be a valid non-negative number' });
    }

    const [result] = await pool.query(
      `INSERT INTO dogs (name, breed, size, age, health_issues, status, demeanor, notes, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, breed, size, parsedAge, healthIssues, status, demeanor, notes, imageUrl]
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
    const { name, breed, size, age, healthIssues, status, demeanor, notes, imageUrl } = req.body;
   
    // Get the existing age if not provided in the request
    let parsedAge = age;
    if (age !== undefined) {
      parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 0) {
        return res.status(400).json({ error: 'Age must be a valid non-negative number' });
      }
    } else {
      // Retrieve the current age from the database
      const [rows] = await pool.query('SELECT age FROM dogs WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      parsedAge = rows[0].age; // Keep the existing age if not provided
    }
        
    const [result] = await pool.query(
      `UPDATE dogs SET name = ?, breed = ?, size = ?, age = ?, health_issues = ?, status = ?, demeanor = ?, notes = ?, image_url = ?
       WHERE id = ?`,
      [name, breed, size, parsedAge, healthIssues, status, demeanor, notes, imageUrl, req.params.id]
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

// Upload multiple images
router.post("/:id/upload", upload.array("images", 5), async (req, res) => {
  const dogId = req.params.id;
  const imagePaths = req.files.map((file) => file.filename);

  try {
      // Fetch existing images
      const [dog] = await pool.query("SELECT images FROM dogs WHERE id = ?", [dogId]);

      let existingImages = [];

      // ✅ Ensure `images` is always an array (prevent JSON errors)
      if (dog.length && dog[0].images) {
          try {
              existingImages = JSON.parse(dog[0].images);
              if (!Array.isArray(existingImages)) {
                  existingImages = [];
              }
          } catch (error) {
              console.error("Error parsing images JSON:", error);
              existingImages = []; // Reset to empty array on error
          }
      }

      // ✅ Append new images to existing ones
      const updatedImages = [...existingImages, ...imagePaths];

      // ✅ Update the database with merged images
      await pool.query("UPDATE dogs SET images = ? WHERE id = ?", [JSON.stringify(updatedImages), dogId]);

      res.json({ success: true, images: updatedImages });
  } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: "Error uploading images" });
  }
});



router.put("/:id/profile-picture", async (req, res) => {
  const { profilePicture } = req.body;
  const dogId = req.params.id;

  try {
      await pool.query("UPDATE dogs SET profile_picture = ? WHERE id = ?", [profilePicture, dogId]);

      res.json({ success: true, profilePicture });
  } catch (error) {
      console.error("Error setting profile picture:", error);
      res.status(500).json({ error: "Error setting profile picture" });
  }
});



// Delete an image
router.delete("/:id/image/:imageName", async (req, res) => {
  const { id, imageName } = req.params;

  try {
      // Fetch existing images from the database
      const [dog] = await pool.query("SELECT images, profile_picture FROM dogs WHERE id = ?", [id]);

      if (!dog.length) {
          return res.status(404).json({ error: "Dog not found" });
      }

      let existingImages = [];
      if (dog[0].images) {
          try {
              existingImages = JSON.parse(dog[0].images);
              if (!Array.isArray(existingImages)) {
                  existingImages = [];
              }
          } catch (error) {
              console.error("Error parsing images JSON:", error);
              existingImages = [];
          }
      }

      // Remove the image from the array
      const updatedImages = existingImages.filter(img => img !== imageName);

      // If the deleted image was the profile picture, reset it to NULL
      let newProfilePicture = dog[0].profile_picture;
      if (dog[0].profile_picture === imageName) {
          newProfilePicture = null;
      }

      // ✅ Update the database
      await pool.query("UPDATE dogs SET images = ?, profile_picture = ? WHERE id = ?", 
                       [JSON.stringify(updatedImages), newProfilePicture, id]);

      // ✅ Delete the actual file from `uploads/` folder
      const imagePath = path.join(__dirname, "uploads", imageName);
      if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
      }

      res.json({ success: true, images: updatedImages, profilePicture: newProfilePicture });

  } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Error deleting image" });
  }
});

module.exports = router;
