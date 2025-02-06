// components/NewDog.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const NewDog = () => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    size: '',
    healthIssues: '',
    status: '',
    demeanor: '',
    notes: '',
    imageUrl: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8080/dogs', formData)
      .then(response => {
        console.log('Dog created successfully:', response.data);
        navigate('/'); // Navigate back to the dog list after creation
      })
      .catch(error => console.error('Error creating dog:', error));
  };

  return (
    <div>
      <h1>Add New Dog Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Breed:</label>
          <input type="text" name="breed" value={formData.breed} onChange={handleChange} />
        </div>
        <div>
          <label>Size:</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} />
        </div>
        <div>
          <label>Health Issues:</label>
          <input type="text" name="healthIssues" value={formData.healthIssues} onChange={handleChange} />
        </div>
        <div>
          <label>Status:</label>
          <input type="text" name="status" value={formData.status} onChange={handleChange} />
        </div>
        <div>
          <label>Demeanor:</label>
          <input type="text" name="demeanor" value={formData.demeanor} onChange={handleChange} />
        </div>
        <div>
          <label>Notes:</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>Image URL:</label>
          <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
        </div>
        <button type="submit">Add Dog</button>
      </form>
    </div>
  );
}

