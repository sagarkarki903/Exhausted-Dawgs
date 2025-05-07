import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Trash2, Upload, ChevronLeft, ChevronRight, X, Loader2, ZoomIn, ZoomOut, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const Gallery = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [galleryImages, setGalleryImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fileInputRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef(null);

  // fetch images & user
  const fetchGallery = async () => {
    try {
      setLoading(true);
      console.log("Fetching gallery images from:", `${backendUrl}/gallery`);
      const res = await axios.get(`${backendUrl}/gallery`, { 
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      console.log("Gallery images response:", res.data);
      if (Array.isArray(res.data)) {
        setGalleryImages(res.data);
      } else {
        console.error("Invalid response format:", res.data);
        setGalleryImages([]);
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      if (err.response) {
        console.error("Server response:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${backendUrl}/auth/profile`, { withCredentials: true });
      setUser(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchGallery();
    fetchUser();

    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [backendUrl]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFileChange = e => setFile(e.target.files[0] || null);
  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      await axios.post(`${backendUrl}/gallery/upload`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage("Image uploaded successfully!");
      fileInputRef.current.value = "";
      setFile(null);
      fetchGallery();
      setTimeout(() => setUploadMessage(""), 3000);
    } catch {
      setUploadMessage("Error uploading image.");
    }
  };

  const handleDeleteImage = async id => {
    await axios.delete(`${backendUrl}/gallery/${id}`, { withCredentials: true });
    fetchGallery();
  };

  const handleImageLoad = (id) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const openLightbox = idx => { setCurrentIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const goToPrev = e => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + galleryImages.length) % galleryImages.length); };
  const goToNext = e => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % galleryImages.length); };

  const handleImageClick = (e) => {
    if (!isZoomed) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPercent = x / rect.width;
      const yPercent = y / rect.height;
      
      setZoomLevel(2);
      setIsZoomed(true);
      
      // Center the zoom on the clicked point
      if (imageRef.current) {
        imageRef.current.style.transformOrigin = `${xPercent * 100}% ${yPercent * 100}%`;
      }
    } else {
      setZoomLevel(1);
      setIsZoomed(false);
    }
  };

  const handleWheel = (e) => {
    if (isZoomed) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, Math.min(3, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  let Navigation = Navbar;
  if (user?.role === "Admin") Navigation = NavAdmin;
  else if (user?.role) Navigation = NavUser;

  const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
  const start = (currentPage - 1) * imagesPerPage;
  const paginated = galleryImages.slice(start, start + imagesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-700">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        <Navigation onDarkModeToggle={toggleDarkMode} isDarkMode={isDarkMode} />
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse through our collection of adorable dogs
          </p>
        </motion.div>

        {/* Navigation Arrow */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div 
              className="fixed bottom-8 right-8 z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChevronUp className="h-6 w-6" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {user && (user.role === "Admin" || user.role === "Marshal") && (
          <motion.div 
            className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              />
              <motion.button
                onClick={handleUpload}
                className="flex items-center space-x-3 text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </motion.button>
            </div>
            {uploadMessage && (
              <motion.p 
                className="mt-2 text-green-600 dark:text-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {uploadMessage}
              </motion.p>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {paginated.map((img, idx) => (
              <motion.div
                key={img.id}
                className="group relative overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-800 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => openLightbox(start + idx)}
              >
                <div className="relative aspect-square">
                  {imageLoading[img.id] !== false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-8 w-8 text-cyan-500" />
                      </motion.div>
                    </div>
                  )}
                  <img
                    src={img.image_url}
                    alt="Gallery"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => handleImageLoad(img.id)}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center items-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-300 ${
                currentPage === 1 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-xl'
              }`}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              Previous
            </motion.button>

            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <motion.button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-xl'
              }`}
              whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
              Next
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.button
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              onClick={closeLightbox}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-8 w-8" />
            </motion.button>

            {/* Left Arrow */}
            <motion.button
              className="absolute left-4 text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="h-8 w-8" />
            </motion.button>

            {/* Image */}
            <motion.img
              src={galleryImages[currentIndex].image_url}
              alt="Gallery"
              className="max-h-[95vh] max-w-[95vw] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right Arrow */}
            <motion.button
              className="absolute right-4 text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="h-8 w-8" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
