
const express = require('express');
const pool = require("./db.js") //imports mysql pool
const router = express.Router();
const cloudinary = require('./config/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage before uploading to Cloudinary

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
    const { name, breed, size, age, healthIssues, status, demeanor, notes } = req.body;
    
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
      `INSERT INTO dogs (name, breed, size, age, health_issues, status, demeanor, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, breed, size, parsedAge, healthIssues, status, demeanor, notes]
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
    const { name, breed, size, age, healthIssues, status, demeanor, notes} = req.body;
   
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
      `UPDATE dogs SET name = ?, breed = ?, size = ?, age = ?, health_issues = ?, status = ?, demeanor = ?, notes = ?
       WHERE id = ?`,
      [name, breed, size, parsedAge, healthIssues, status, demeanor, notes, req.params.id]
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

// GET /dogs/:id/images - Retrieve all images for a specific dog
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve image URLs from the database
    const [images] = await pool.query('SELECT image_url FROM dog_images WHERE dog_id = ?', [id]);

    res.status(200).json(images);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// POST /dogs/:id/upload - Upload an image for a specific dog
router.post('/:id/upload', upload.single('image'), async (req, res) => {
  try {
    const { path } = req.file;
    const { id } = req.params;

    // Check the current number of images for the dog
    const [images] = await pool.query('SELECT image_url FROM dog_images WHERE dog_id = ?', [id]);
    if (images.length >= 5) {
      return res.status(400).json({ error: 'Maximum of 5 images allowed per dog.' });
    }

    // Upload image to Cloudinary in the dog's specific folder
    const result = await cloudinary.uploader.upload(path, {
      folder: `dog_profiles/${id}`,
      public_id: `${Date.now()}`,
    });

    // Store image URL in the database
    await pool.query('INSERT INTO dog_images (dog_id, image_url) VALUES (?, ?)', [id, result.secure_url]);

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// PUT /dogs/:id/profile-picture - Set profile picture for a specific dog
router.put('/:id/profile-picture', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    // Update the dog's profile picture URL in the database
    await pool.query('UPDATE dogs SET profile_picture_url = ? WHERE id = ?', [imageUrl, id]);

    res.status(200).json({ message: 'Profile picture updated successfully.' });
  } catch (error) {
    console.error('Error setting profile picture:', error);
    res.status(500).json({ error: 'Failed to set profile picture' });
  }
});

// DELETE /dogs/:id/images?imageUrl=...
router.delete('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.query;
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl query parameter is required' });
    }

    // Retrieve the image record from the database using image_url
    const [rows] = await pool.query('SELECT image_url FROM dog_images WHERE dog_id = ? AND image_url = ?', [id, imageUrl]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Extract the public_id from the image URL
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return res.status(500).json({ error: 'Could not determine public_id from URL' });
    }

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete the image record from the database
    await pool.query('DELETE FROM dog_images WHERE dog_id = ? AND image_url = ?', [id, imageUrl]);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Helper function: Extract Cloudinary public_id from image URL
function getPublicIdFromUrl(url) {
  try {
    // Example URL:
    // https://res.cloudinary.com/your_cloud_name/image/upload/v1742960744/dog_profiles/19/1742960743930.png
    let parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let remainder = parts[1]; // "v1742960744/dog_profiles/19/1742960743930.png"
    // Remove version part if present
    let segments = remainder.split('/');
    if (segments[0].startsWith('v')) {
      segments.shift();
    }
    let pathAndFile = segments.join('/'); // "dog_profiles/19/1742960743930.png"
    // Remove file extension to get the public_id
    const dotIndex = pathAndFile.lastIndexOf('.');
    if (dotIndex !== -1) {
      return pathAndFile.substring(0, dotIndex);
    }
    return pathAndFile;
  } catch (err) {
    console.error('Error extracting public id from url:', err);
    return null;
  }
}


module.exports = router;
