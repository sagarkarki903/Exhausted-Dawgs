import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Trash2, Upload } from 'lucide-react';
import { toast } from "react-hot-toast";

const Gallery = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [galleryImages, setGalleryImages] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fileInputRef = useRef(null);

  // fetch images & user
  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${backendUrl}/gallery`, { withCredentials: true });
      setGalleryImages(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load gallery.");
    }
  };
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${backendUrl}/auth/profile`, { withCredentials: true });
      setUser(res.data);
    } catch {
      // ignore
    }
  };
  useEffect(() => {
    fetchGallery();
    fetchUser();
  }, [backendUrl]);

  // upload
  const handleFileChange = e => setFile(e.target.files[0] || null);
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    try {
      await axios.post(`${backendUrl}/gallery/upload`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded successfully!");
      fileInputRef.current.value = "";
      setFile(null);
      fetchGallery();
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image.");
    }
  };

  // delete
  const handleDeleteImage = async id => {
    try {
      await axios.delete(`${backendUrl}/gallery/${id}`, { withCredentials: true });
      toast.success("Image deleted.");
      fetchGallery();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image.");
    }
  };

  // lightbox controls
  const openLightbox = idx => { setCurrentIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const goToPrev = e => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + galleryImages.length) % galleryImages.length); };
  const goToNext = e => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % galleryImages.length); };

  // pick nav
  let Navigation = Navbar;
  if (user?.role === "Admin") Navigation = NavAdmin;
  else if (user?.role) Navigation = NavUser;

  // pagination
  const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
  const start = (currentPage - 1) * imagesPerPage;
  const paginated = galleryImages.slice(start, start + imagesPerPage);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 mt-4 text-center">Dog Gallery</h1>

        {(user?.role === "Admin" || user?.role === "Marshal") && (
          <div className="mb-8 flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="border border-gray-300 p-2 rounded-md w-full"
            />
            <button
              onClick={handleUpload}
              className="flex items-center space-x-3 text-sm bg-black text-white px-5 py-3 rounded-md hover:opacity-80"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          </div>
        )}

        <div className="mt-4 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {paginated.map((img, idx) => (
            <div
              key={img.id}
              className="break-inside-avoid mb-4 relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => openLightbox(start + idx)}
            >
              <img
                src={img.image_url}
                alt="Gallery"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {(user?.role === "Admin" || user?.role === "Marshal") && (
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteImage(img.id); }}
                  className="absolute top-2 right-2 scale-0 group-hover:scale-100 transition-transform duration-300 bg-red-500 text-white rounded-full p-2 hover:scale-110"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 ">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i+1}
                onClick={() => setCurrentPage(i+1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i+1
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-200"
                } cursor-pointer`}
              >
                {i+1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-5 text-white text-3xl hover:scale-110 transform cursor-pointer"
            onClick={closeLightbox}
          >&times;</button>
          <button
            className="absolute left-5 text-white text-3xl hover:scale-110 transform cursor-pointer"
            onClick={goToPrev}
          >&#10094;</button>
          <div className="max-w-screen-md max-h-screen text-center">
            <img
              src={galleryImages[currentIndex].image_url}
              alt="Expanded"
              className="mx-auto object-contain max-h-[80vh] max-w-[80vw]"
            />
            <p className="text-white mt-2 text-lg">Our Pups</p>
          </div>
          <button
            className="absolute right-5 text-white text-3xl hover:scale-110 transform cursor-pointer"
            onClick={goToNext}
          >&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
