import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MoveLeft, Trash, Star } from "lucide-react"
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8080/dogs/${id}`)
      .then(res => {
        setDog(res.data);
        setFormData(res.data);
        setImages(res.data.images || []);
        setSelectedProfilePic(res.data.profilePicture);
      })
      .catch(err => console.error('Error fetching dog details:', err));
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchDogData();
  }, [id]);

  const fetchDogData = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8080/dogs/${id}`);
      setDog(res.data);
      setImages(res.data.images || []);
      setSelectedProfilePic(res.data.profilePicture || null);
    } catch (err) {
      console.error("Error fetching dog details:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    try {
        const response = await axios.post(`http://127.0.0.1:8080/dogs/${id}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        setImages(prevImages => [...prevImages, ...response.data.images]); // ✅ Append new images
        setDog(prev => ({ ...prev, images: [...prev.images, ...response.data.images] })); // ✅ Update state

    } catch (error) {
        console.error("Error uploading images:", error);
    }
};




const handleDeleteImage = async (imageName) => {
  if (!window.confirm("Are you sure you want to delete this image?")) return;

  try {
      const response = await axios.delete(`http://127.0.0.1:8080/dogs/${id}/image/${imageName}`);

      setImages(prevImages => prevImages.filter(img => img !== imageName)); // ✅ Remove image from state

      if (selectedProfilePic === imageName) {
          setSelectedProfilePic(null); // ✅ Reset profile picture if it was deleted
      }

      setDog(prev => ({
          ...prev,
          images: prev.images.filter(img => img !== imageName),
          profile_picture: response.data.profilePicture
      }));

  } catch (error) {
      console.error("Error deleting image:", error);
  }
};



const handleSetProfilePicture = async (imageName) => {
  try {
      const response = await axios.put(`http://127.0.0.1:8080/dogs/${id}/profile-picture`, { profilePicture: imageName });

      setSelectedProfilePic(imageName); // ✅ Update profile picture in state
      setDog(prev => ({ ...prev, profile_picture: response.data.profilePicture })); // ✅ Update dog state

  } catch (error) {
      console.error("Error setting profile picture:", error);
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
          console.log('Dog deleted successfully');
          navigate('/dogs');
        })
        .catch(err => console.error('Error deleting dog:', err));
    }
  };

  if (!dog) return <div className="text-center py-10">Loading...</div>;

  return (
    <motion.div
      className="max-w-4xl mx-auto p-8 bg-white rounded-xl border border-gray-200 mt-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <motion.div className="flex gap-4 items-center mb-6 text-black" whileHover={{ scale: 1.03 }}>
        <MoveLeft className="w-6 h-6 text-gray-700" />
        <Link to="/dogs" className="text-lg font-semibold text-gray-800 hover:text-red-800 transition">Back to Gallery</Link>
      </motion.div>

      {/* Dog Name */}
      <h2 className="text-4xl font-extrabold text-center text-gray-900">
        {editing ? (
          <input className="w-full p-2 border rounded-md text-center text-3xl font-bold" name="name" value={formData.name || ""} onChange={handleInputChange} />
        ) : (
          dog.name
        )}
      </h2>

      <div className="flex justify-center my-6">
        <img src={`http://127.0.0.1:8080/uploads/${dog.profile_picture}`} 
             alt="Profile" 
             className="w-72 h-72 object-cover rounded-lg shadow-lg border border-gray-200" />
      </div>



      {/* Dog Details */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        {[
          { label: "Breed", key: "breed" },
          { label: "Size", key: "size" },
          { label: "Age", key: "age", suffix: " years" },
          { label: "Status", key: "status" },
          { label: "Demeanor", key: "demeanor" },
          { label: "Health Issues", key: "health_issues" },
          { label: "Notes", key: "notes", type: "textarea" },
        ].map((field, index) => (
          <div key={index} className="mb-4">
            <p className="text-gray-700 font-semibold">{field.label}:</p>
            {editing ? (
              field.type === "textarea" ? (
                <textarea
                  className="w-full p-2 border rounded-md mt-1"
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <input
                  className="w-full p-2 border rounded-md mt-1"
                  name={field.key}
                  value={formData[field.key] || ""}
                  onChange={handleInputChange}
                />
              )
            ) : (
              <p className="text-gray-600">{dog[field.key]}{field.suffix || ""}</p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        {editing ? (
          <>
            <motion.button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-green-700 transition"
              whileHover={{ scale: 1.05 }}
            >
              Save
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-lg hover:bg-gray-600 transition"
              whileHover={{ scale: 1.05 }}
            >
              Cancel
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              onClick={handleEdit}
              className="bg-yellow-500 text-white px-6 py-2 rounded-md shadow-lg hover:bg-yellow-600 transition"
              whileHover={{ scale: 1.05 }}
            >
              Edit
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="bg-red-700 text-white px-6 py-2 rounded-md shadow-lg hover:bg-red-800 transition"
              whileHover={{ scale: 1.05 }}
            >
              Delete
            </motion.button>
          </>
        )}
      </div>
            {/* Image Upload */}
            <div className="mt-6">
        <label className="block text-lg font-semibold mb-2">Upload Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="border p-2 rounded w-full" />
      </div>

      {/* Image Gallery */}
      <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Gallery</h3>
    <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
            <div key={index} className="relative">
                <img src={`http://127.0.0.1:8080/uploads/${image}`} alt={`Dog ${index}`} className="w-full h-32 object-cover rounded-md shadow" />
                
                {/* Set as Profile Picture */}
                <button onClick={() => handleSetProfilePicture(image)} className="absolute top-2 left-2 bg-blue-600 text-white rounded-full p-1 shadow hover:bg-blue-700 transition">
                    <Star className="w-5 h-5" />
                </button>

                {/* Delete Image */}
                <button onClick={() => handleDeleteImage(image)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition">
                    <Trash className="w-5 h-5" />
                </button>
            </div>
            ))}
        </div>
    </div>
    </motion.div>
  );
};

export default DogProfile;
