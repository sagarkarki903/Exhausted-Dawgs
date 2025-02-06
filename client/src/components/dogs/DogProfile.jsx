import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import axios from 'axios';


const DogProfile = () => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Retrieve dog details when the component mounts or when 'id' changes
  useEffect(() => {
    axios.get(`http://127.0.0.1:8080/dogs/${id}`)
      .then(res => {
        setDog(res.data);
        setFormData(res.data); // Pre-fill form with current dog data
      })
      .catch(err => console.error('Error fetching dog details:', err));
  }, [id]);

  // Update local state as the user edits fields
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Toggle editing mode
  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setFormData(dog); // Reset form to original values if canceled
  };

  // Send updated data to the server
  const handleSave = () => {
    axios.put(`http://127.0.0.1:8080/dogs/${id}`, formData)
      .then(() => {
        console.log('Dog updated successfully');
        setDog(formData); // Update local dog data with new form data
        setEditing(false);
      })
      .catch(err => console.error('Error updating dog details:', err));
  };

  // Delete the dog record
  const handleDelete = () => {
    axios.delete(`http://127.0.0.1:8080/dogs/${id}`)
      .then(() => {
        console.log('Dog deleted successfully');
        // Optionally, redirect or update the UI to remove this dog profile
      })
      .catch(err => console.error('Error deleting dog:', err));
  };

  // Display a loading state if dog details are not yet fetched
  if (!dog) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dog Profile: {dog.name}</h2>
      <p><strong>Breed:</strong> {dog.breed}</p>
      <p><strong>Size:</strong> {dog.size}</p>
      <p><strong>Status:</strong> {dog.status}</p>
      <p><strong>Demeanor:</strong> {dog.demeanor}</p>
      <p><strong>Health Issues:</strong> {dog.health_issues}</p>
      <p><strong>Notes:</strong> {dog.notes}</p>
      {dog.image_url && <img src={dog.image_url} alt={dog.name} />}
      {editing ? (
        <div>
          <input
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
          />
          <input
            name="breed"
            value={formData.breed || ''}
            onChange={handleInputChange}
          />
          <input
            name="size"
            value={formData.size || ''}
            onChange={handleInputChange}
          />
          {/* Additional fields for health issues, status, demeanor, etc. */}
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <p>Name: {dog.name}</p>
          <p>Breed: {dog.breed}</p>
          <p>Size: {dog.size}</p>
          {/* Display additional fields */}
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>



  );
};

export default DogProfile;
