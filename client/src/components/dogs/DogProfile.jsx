import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";
import { Edit, Save, X, Trash2, Upload, ImageIcon } from 'lucide-react';
import PropTypes from 'prop-types';

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

const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  // Authentication state
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    axios.get(`http://127.0.0.1:8080/dogs/${id}`)
      .then(res => {
        setDog(res.data);
        setFormData(res.data);
      })
      .catch(err => console.error('Error fetching dog details:', err));
  }, [id]);

  const fetchDogData = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8080/dogs/${id}`);
      setDog(res.data);
    } catch (err) {
      console.error("Error fetching dog details:", err);
    }
  };

  const fetchDogImages = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8080/dogs/${id}/images`);
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
        const res = await axios.get("http://localhost:8080/auth/profile", {
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
      await axios.put(`http://127.0.0.1:8080/dogs/${id}/profile-picture`, { imageUrl });
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
    axios.put(`http://127.0.0.1:8080/dogs/${id}`, formData)
      .then(() => {
        setDog(formData);
        setEditing(false);
      })
      .catch(err => console.error('Error updating dog details:', err));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this dog?')) {
      axios.delete(`http://127.0.0.1:8080/dogs/${id}`)
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
      const res = await axios.post(`http://127.0.0.1:8080/dogs/${id}/upload`, imageFormData, {
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
    await axios.delete(`http://127.0.0.1:8080/dogs/${id}/images`, {
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
    <div className='min-h-screen bg-neutral-100'>
      {/* Navigation */}
        <div className="mb-8 bg-white">
          {!loggedIn ? <Navbar /> : role === "Admin" ? <NavAdmin /> : <NavUser />}
        </div>
      <motion.div
        className="w-full max-w-4xl mx-auto px-4 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={dog.profile_picture_url || "/dog2.jpeg"}
              alt="Profile"
              className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full shadow-xl border-4 border-white"
            />
            {(role === "Admin" || role === "Marshal") && (
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-6">
            {editing ? (
              <input
                className="text-center text-3xl font-bold border-b border-gray-300 focus:outline-none"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            ) : (
              <h1 className="text-4xl font-bold text-gray-900">{dog.name}</h1>
            )}
          </div>
        </div>

        {/* Dog Details Card */}
        <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-300">
          <div className="flex justify-between items-center bg-neutral-200 p-4 rounded-t-lg mb-4">
            <h2 className="text-xl font-semibold text-primary">Details</h2>
            {(role === "Admin" || role === "Marshal") && !editing && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 text-gray-800 font-semibold text-sm hover:cursor-pointer"
              >
                <Edit className="h-4 w-4 " />
                <span>Edit</span>
              </button>
            )}
          </div>
          {[
            { label: "Breed", key: "breed" },
            { label: "Size", key: "size" },
            { label: "Age", key: "age", suffix: " years" },
            { label: "Status", key: "status" },
            { label: "Demeanor", key: "demeanor" },
            { label: "Health Issues", key: "health_issues" },
            { label: "Notes", key: "notes", type: "textarea" },
          ].map((field, index) => (
            <div key={index} className="p-4">
              <p className="text-sm font-semibold text-gray-600">{field.label}</p>
              {editing ? (
                field.type === "textarea" ? (
                  <textarea
                    className=" p-2 border border-gray-400 rounded-sm mt-2 w-full"
                    name={field.key}
                    value={formData[field.key] || ""}
                    onChange={handleInputChange}
                    rows={4}
                  />
                ) : (
                  <input
                    className="w-full p-2 border border-gray-400 rounded-sm mt-2"
                    name={field.key}
                    value={formData[field.key] || ""}
                    onChange={handleInputChange}
                  />
                )
              ) : (
                <p className="text-gray-700">{dog[field.key]} {field.suffix || ""}</p>
              )}
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
        </div>

        {/* Admin Action Buttons */}
        {(role === "Admin" || role === "Marshal") && !editing && (
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={handleDelete}
              className="flex items-center space-x-3 bg-red-800 text-white px-5 py-3 rounded-md text-sm hover:bg-red-700 hover:cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Profile</span>
            </button>
          </div>
        )}

        {/* Image Upload and Gallery */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8"> 
        <h3 className="text-lg font-semibold mb-3 bg-neutral-200 p-6">Photo Gallery</h3>
          <div className='p-4'>
            {(role === "Admin" || role === "Marshal") && (
            <div className="mb-4 flex items-center space-x-4">
              <input type="file" onChange={handleFileChange} className="border border-gray-300 p-2 rounded-md w-full"/>
              <button onClick={handleImageUpload} className="flex items-center space-x-3 text-sm bg-black text-white px-5 py-3 rounded-md hover:cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
            </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img.image_url} alt="Dog" className="w-full h-82 object-cover rounded-md" />
                    {(role === "Admin" || role === "Marshal") && (
                    <button 
                    onClick={() => handleDeleteImage(img.image_url)}
                     className="absolute inset-0 flex items-center justify-center text-md font-semibold text-red-700 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition hover:cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  <span>Delete</span>
                </button>
                )}
                  </div>
                ))}
              </div>
            
          </div>
        
        </div>

        {/* Modal for selecting profile picture */}
        <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)}>
          <h2 className="text-xl font-semibold mb-4">Choose Profile Picture</h2>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img.image_url || "/dog2.jpeg"} alt="Dog" className="w-full h-32 object-cover rounded-md" />
                <button
                  onClick={() => handleProfilePictureChange(img.image_url)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition"
                >
                  <ImageIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </Modal>
      </motion.div>
             <Footer />
    </div>
  );
};

export default DogProfile;
