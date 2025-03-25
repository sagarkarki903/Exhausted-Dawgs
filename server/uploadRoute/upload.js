// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary"); // path to cloudinary config
// const { User } = require("../models"); // make sure ../models/index.js exists



// // Setup Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "profile_pictures",
//     format: async () => "png", // or derive from file
//     public_id: (req, file) => `user_${req.user.id}_${Date.now()}`,
//   },
// });

// const upload = multer({ storage });

// router.post("/upload-profile-pic", upload.single("profile_pic"), async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const imageUrl = req.file.path;

//     await User.update(
//       { profile_pic: imageUrl },
//       { where: { id: userId } }
//     );

//     res.status(200).json({ profile_pic: imageUrl });
//   } catch (err) {
//     console.error("Cloudinary Upload Error:", err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// module.exports = router;
