import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";
import { Edit, Save, X, Trash2, Upload, ImageIcon, PawPrint } from 'lucide-react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const sizeOptions = [
  { value: 'Small',  label: 'Small'   },
  { value: 'Medium', label: 'Medium'  },
  { value: 'Large',  label: 'Large'   },
  { value: 'XLarge', label: 'X‑Large' },
];

const demeanorOptions = [
  { value: 'Red',    label: 'Red (Not Friendly but walkable)' },
  { value: 'Gray',   label: 'Gray (Aggressive & Unwalkable)' },
  { value: 'Yellow', label: 'Yellow (Friendly & Walkable)'  },
];

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'Pending',   label: 'Pending'   },
  { value: 'Adopted',   label: 'Adopted'   },
  { value: 'Fostered',  label: 'Fostered'  },
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// A simple Modal component using Tailwind CSS
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full">
        <button className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const getDemeanorColor = (demeanor) => {
  switch (demeanor) {
    case "Red":
      return "bg-red-100 text-red-800 border-red-200";
    case "Gray":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Yellow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getDemeanorDescription = (demeanor) => {
  switch (demeanor) {
    case "Red":
      return "Not Friendly but walkable";
    case "Gray":
      return "Aggressive & Unwalkable";
    case "Yellow":
      return "Friendly & Walkable";
    default:
      return "";
  }
};

const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [scrollWidth, setScrollWidth] = useState("0%");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? savedMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [breedOptions, setBreedOptions] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  // load dog.ceo breed list on mount
  useEffect(() => {
    axios.get('https://dog.ceo/api/breeds/list/all')
      .then(res => {
        const msg = res.data.message;
        const opts = [];
        Object.entries(msg).forEach(([breed, subs]) => {
          if (subs.length === 0) {
            opts.push({ value: breed, label: capitalize(breed) });
          } else {
            subs.forEach(sub =>
              opts.push({
                value: `${breed}/${sub}`,
                label: `${capitalize(sub)} ${capitalize(breed)}`,
              })
            );
          }
        });
        setBreedOptions(opts);
      })
      .catch(console.error)
      .finally(() => setLoadingBreeds(false));
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : "0%";
      setScrollWidth(scrolled);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const handleSelect = field => option => {
    setFormData(fd => ({ ...fd, [field]: option?.value || '' }));
  };

  useEffect(() => {
    axios.get(`${backendUrl}/dogs/${id}`)
      .then(res => {
        setDog(res.data);
        setFormData(res.data);
      })
      .catch(err => console.error('Error fetching dog details:', err));
  }, [id]);

  const fetchDogData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/dogs/${id}`);
      setDog(res.data);
    } catch (err) {
      console.error("Error fetching dog details:", err);
    }
  };

  const fetchDogImages = async () => {
    try {
      const res = await axios.get(`${backendUrl}/dogs/${id}/images`);
      setImages(res.data);
    } catch (err) {
      console.error('Error fetching dog images:', err);
    }
  };

  useEffect(() => {
    fetchDogData();
    fetchDogImages();
  }, [id]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
        }
      } catch {
        setLoggedIn(false);
        setRole("");
      }
    };

    checkAuth();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = async (imageUrl) => {
    try {
      await axios.put(`${backendUrl}/dogs/${id}/profile-picture`, { imageUrl });
      setDog((prevDog) => ({ ...prevDog, profile_picture_url: imageUrl }));
      setShowImageModal(false);
    } catch (err) {
      console.error('Error setting profile picture:', err);
    }
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setFormData(dog);
  };

  const handleSave = () => {
    axios.put(`${backendUrl}/dogs/${id}`, formData)
      .then(() => {
        setDog(formData);
        setEditing(false);
      })
      .catch(err => console.error('Error updating dog details:', err));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this dog?')) {
      axios.delete(`${backendUrl}/dogs/${id}`)
        .then(() => {
          navigate('/dogs');
        })
        .catch(err => console.error('Error deleting dog:', err));
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    const imageFormData = new FormData();
    imageFormData.append('image', selectedFile);
    try {
      const res = await axios.post(`${backendUrl}/dogs/${id}/upload`, imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDog(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      fetchDogImages();
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      await axios.delete(`${backendUrl}/dogs/${id}/images`, {
        params: { imageUrl }
      });
    fetchDogImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };



  
  if (!dog) return <div className="text-center py-10">Loading...</div>;

  // Animation variants similar to your second file
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-700 relative">
      {/* Navigation */}
      <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        {!loggedIn ? (
          <Navbar 
            onDarkModeToggle={handleDarkModeToggle}
            isDarkMode={isDarkMode}
          />
        ) : role === "Admin" ? (
          <NavAdmin 
            onDarkModeToggle={handleDarkModeToggle}
            isDarkMode={isDarkMode}
          />
        ) : (
          <NavUser 
            onDarkModeToggle={handleDarkModeToggle}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      <motion.div
        className="w-full max-w-4xl mx-auto px-4 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header */}
        <motion.section 
          className="py-20 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-2xl mb-8 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="absolute inset-0 z-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute z-2 text-white/20"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                }}
                animate={{ y: [0, 10, 0], rotate: [0, 360] }}
                transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
              >
                <PawPrint aria-label="Decorative paw print" />
              </motion.div>
            ))}
          </motion.div>

          <div className="relative z-10 text-center">
            <motion.div 
              className="relative inline-block"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.img
                src={dog.profile_picture_url || "/dog2.jpeg"}
                alt="Profile"
                className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full shadow-2xl border-4 border-white/80"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              {(role === "Admin" || role === "Marshal") && (
                <motion.button
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ImageIcon className="h-5 w-5 text-indigo-600" />
                </motion.button>
              )}
            </motion.div>
            <div className="mt-6">
              {editing ? (
                <input
                  className="text-center text-3xl font-bold border-b border-white/30 focus:outline-none bg-transparent text-white placeholder-white/70"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  placeholder="Enter dog's name"
                />
              ) : (
                <motion.h1 
                  className="text-4xl font-bold text-white drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {dog.name}
                </motion.h1>
              )}
            </div>
          </div>
        </motion.section>

        {/* Dog Details Card */}
        <motion.section
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl mb-8 border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-between items-center bg-gradient-to-r from-cyan-500 to-indigo-600 p-6 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">Details</h2>
            {(role === "Admin" || role === "Marshal") && !editing && (
              <motion.button
                onClick={handleEdit}
                className="flex items-center space-x-2 text-white font-semibold text-sm hover:cursor-pointer bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </motion.button>
            )}
          </div>
          {[
            { label: "Breed",     key: "breed" },
            { label: "Size",      key: "size" },
            { label: "Age",       key: "age", suffix: " years" },
            { label: "Status",    key: "status" },
            { label: "Demeanor",  key: "demeanor" },
            { label: "Zone",      key: "zone" }, 
            { label: "Health Issues", key: "health_issues" },
            { label: "Notes",     key: "notes", type: "textarea" },
          ].map((field) => (
            <div key={field.key} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-center p-4">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32 mb-2 sm:mb-0">
                  {field.label}
                </label>
                {editing ? (
                  field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      value={formData[field.key] || ""}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      rows="3"
                    />
                  ) : field.key === "breed" ? (
                    <Select
                      options={breedOptions}
                      isLoading={loadingBreeds}
                      onChange={handleSelect(field.key)}
                      value={breedOptions.find(o => o.value === formData[field.key]) || null}
                      placeholder="Select breed…"
                      classNamePrefix="react-select"
                      className="flex-1"
                    />
                  ) : field.key === "size" ? (
                    <Select
                      options={sizeOptions}
                      onChange={handleSelect(field.key)}
                      value={sizeOptions.find(o => o.value === formData[field.key]) || null}
                      placeholder="Select size…"
                      classNamePrefix="react-select"
                      className="flex-1"
                    />
                  ) : field.key === "status" ? (
                    <Select
                      options={statusOptions}
                      onChange={handleSelect(field.key)}
                      value={statusOptions.find(o => o.value === formData[field.key]) || null}
                      placeholder="Select status…"
                      classNamePrefix="react-select"
                      className="flex-1"
                    />
                  ) : field.key === "demeanor" ? (
                    <Select
                      options={demeanorOptions}
                      onChange={handleSelect(field.key)}
                      value={demeanorOptions.find(o => o.value === formData[field.key]) || null}
                      placeholder="Select demeanor…"
                      classNamePrefix="react-select"
                      className="flex-1"
                    />
                  ) : (
                    <input
                      type={field.key === "age" ? "number" : "text"}
                      name={field.key}
                      value={formData[field.key] || ""}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  )
                ) : (
                  <div className="flex-1">
                    {field.key === "demeanor" ? (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block ${getDemeanorColor(dog[field.key])} px-3 py-1 rounded-full text-sm font-medium`}>
                          {dog[field.key]}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getDemeanorDescription(dog[field.key])}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-900 dark:text-white">
                        {dog[field.key]}
                        {field.suffix}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {editing && (
            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={handleCancel} className="flex items-center mb-4 space-x-1 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100 hover:cursor-pointer">
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button onClick={handleSave} className="flex items-center mb-4 mr-4 space-x-1 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 hover:cursor-pointer">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </motion.section>

        {/* Admin Action Buttons */}
        {(role === "Admin" || role === "Marshal") && !editing && (
          <motion.div 
            className="flex justify-center space-x-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={handleDelete}
              className="flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-xl text-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Profile</span>
            </motion.button>
          </motion.div>
        )}

        {/* Image Upload and Gallery */}
        <motion.section
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-500 to-indigo-600 p-6 rounded-t-2xl text-white drop-shadow-md">Photo Gallery</h3>
          <div className='p-6'>
            {(role === "Admin" || role === "Marshal") && (
              <motion.div 
                className="mb-6 flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-shadow duration-300"
                />
                <motion.button 
                  onClick={handleImageUpload}
                  className="flex items-center space-x-3 text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </motion.button>
              </motion.div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {images.map((img, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <img 
                    src={img.image_url} 
                    alt="Dog" 
                    className="w-full h-82 object-cover rounded-xl shadow-md hover:shadow-xl transition-all duration-300" 
                  />
                  {(role === "Admin" || role === "Marshal") && (
                    <motion.button 
                      onClick={() => handleDeleteImage(img.image_url)}
                      className="absolute inset-0 flex items-center justify-center text-md font-semibold text-red-700 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      <span>Delete</span>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Modal for selecting profile picture */}
        <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Choose Profile Picture</h2>
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src={img.image_url || "/dog2.jpeg"} 
                    alt="Dog" 
                    className="w-full h-32 object-cover rounded-xl shadow-md" 
                  />
                  <button
                    onClick={() => handleProfilePictureChange(img.image_url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                  >
                    <ImageIcon className="h-5 w-5 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </Modal>
      </motion.div>

      {scrollWidth !== '0%' && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          aria-label="Scroll to top"
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transform group-hover:scale-110 transition-transform duration-300"
            >
              <path d="m18 15-6-6-6 6"/>
            </svg>
            <motion.div
              className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.button>
      )}

      <Footer />
    </div>
  );
};

export default DogProfile;
