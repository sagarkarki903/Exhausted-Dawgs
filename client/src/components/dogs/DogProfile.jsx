import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8080/dogs/${id}`)
      .then(res => {
        setDog(res.data);
        setFormData(res.data);
      })
      .catch(err => console.error('Error fetching dog details:', err));
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        {editing ? (
          <input className="w-full p-2 border rounded-md" name="name" value={formData.name || ''} onChange={handleInputChange} />
        ) : (
          dog.name
        )}
      </h2>
      <div className="mt-4 flex flex-col items-center">
        {dog.image_url && <img src={dog.image_url} alt={dog.name} className="w-64 h-64 rounded-md shadow-md" />}
        <p className="text-gray-600 text-lg mt-4">
          <strong>Breed:</strong> {editing ? <input className="p-2 border rounded-md" name="breed" value={formData.breed || ''} onChange={handleInputChange} /> : dog.breed}
        </p>
        <p className="text-gray-600">
          <strong>Size:</strong> {editing ? <input className="p-2 border rounded-md" name="size" value={formData.size || ''} onChange={handleInputChange} /> : dog.size}
        </p>
        <p className="text-gray-600">
          <strong>Age:</strong> {editing ? <input type="number" className="p-2 border rounded-md" name="age" value={formData.age || ''} onChange={handleInputChange} /> : `${dog.age} years`}
        </p>
        <p className="text-gray-600">
          <strong>Status:</strong> {editing ? <input className="p-2 border rounded-md" name="status" value={formData.status || ''} onChange={handleInputChange} /> : dog.status}
        </p>
        <p className="text-gray-600">
          <strong>Demeanor:</strong> {editing ? <input className="p-2 border rounded-md" name="demeanor" value={formData.demeanor || ''} onChange={handleInputChange} /> : dog.demeanor}
        </p>
        <p className="text-gray-600">
          <strong>Health Issues:</strong> {editing ? <input className="p-2 border rounded-md" name="health_issues" value={formData.health_issues || ''} onChange={handleInputChange} /> : dog.health_issues}
        </p>
        <p className="text-gray-600">
          <strong>Notes:</strong> {editing ? <textarea className="p-2 border rounded-md w-full" name="notes" value={formData.notes || ''} onChange={handleInputChange}></textarea> : dog.notes}
        </p>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        {editing ? (
          <>
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Save</button>
            <button onClick={handleCancel} className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={handleEdit} className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600">Edit</button>
            <button onClick={handleDelete} className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800">Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default DogProfile;
