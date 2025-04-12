import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Trash2, Upload } from 'lucide-react';

const Gallery = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [galleryImages, setGalleryImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [user, setUser] = useState(null);

  // For Lightbox functionality
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

    const fileInputRef = useRef(null);


  // Fetch gallery images
  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${backendUrl}/gallery`, { withCredentials: true });
      setGalleryImages(res.data);
    } catch (error) {
      console.error("Error fetching gallery images", error);
    }
  };

  // Fetch logged-in user profile
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${backendUrl}/auth/profile`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchUser();
  }, [backendUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle upload to gallery
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${backendUrl}/gallery/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage("Image uploaded successfully!");
      setFile(null);
      // Clear the file input element by resetting its value via ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchGallery();
      // Optionally clear the upload message after 3 seconds
      setTimeout(() => {
        setUploadMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error uploading gallery image", error);
      setUploadMessage("Error uploading image.");
    }
  };

  // Delete a gallery image (only for Admin/Marshal)
  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`${backendUrl}/gallery/${id}`, { withCredentials: true });
      fetchGallery();
    } catch (error) {
      console.error("Error deleting gallery image:", error);
    }
  };

  // Lightbox Handlers
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  // Choose navigation based on user role
  let Navigation = Navbar;
  if (user?.role === "Admin") Navigation = NavAdmin;
  else if (user?.role) Navigation = NavUser;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 mt-4 text-center">Dog Gallery</h1>
        
        {/* Show upload controls only if user is Admin or Marshal */}
        {user && (user.role === "Admin" || user.role === "Marshal") && (
          <div className="mb-8 flex items-center space-x-4">
            <input type="file" onChange={handleFileChange} className="border border-gray-300 p-2 rounded-md w-full"/>
            <button
              onClick={handleUpload}
              className="flex items-center space-x-3 text-sm bg-black text-white px-5 py-3 rounded-md hover:cursor-pointer"
            >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
            </button>
            {uploadMessage && <p className="mt-2 text-green-600">{uploadMessage}</p>}
          </div>
        )}

        {/* Gallery Grid */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((img, index) => (
                <div
                key={img.id}
                className="relative group overflow-hidden cursor-pointer rounded-lg border border-gray-200 shadow-lg transition-transform duration-300 hover:shadow-xl"
                >
                <img
                    src={img.image_url}
                    alt="Gallery"
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => openLightbox(index)}
                />
                {/* Delete Button (only Admin/Marshal) */}
                {user && (user.role === "Admin" || user.role === "Marshal") && (
                    <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening lightbox
                        handleDeleteImage(img.id);
                    }}
                    className="absolute top-2 right-2 scale-0 group-hover:scale-100 transition-transform duration-300 bg-red-500 text-white rounded-full p-2 shadow-lg hover:shadow-xl hover:scale-105 hover:cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
                </div>
            ))}
            </div>


      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-5 right-5 text-white text-3xl hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-100"
            onClick={closeLightbox}
          >
            &times;
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-5 text-white text-3xl font-bold hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-100"
            onClick={goToPrev}
          >
            &#10094;
          </button>

          {/* Image and Caption */}
          <div className="text-center max-w-screen-md max-h-screen">
            <img
              src={galleryImages[currentIndex].image_url}
              alt="Expanded"
              className="mx-auto object-contain max-h-[80vh] max-w-[80vw]"
            />
            {/* Hardcoded caption - replace with DB data if needed */}
            <p className="text-white mt-2 text-lg">Our Pups</p>
          </div>

          {/* Next Button */}
          <button
            className="absolute right-5 text-white text-3xl font-bold hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-100"    
            onClick={goToNext}
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
