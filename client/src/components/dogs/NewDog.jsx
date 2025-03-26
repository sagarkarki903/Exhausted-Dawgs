import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export const NewDog = () => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    size: '',
    age: '',
    healthIssues: '',
    status: '',
    demeanor: '',
    notes: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "age" && !/^[0-9]*$/.test(value)) return;
    setFormData({
      ...formData,
      [name]: value
    }); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8080/dogs', formData)
      .then(response => {
        console.log('Dog created successfully:', response.data);
        navigate('/dogs');
      })
      .catch(error => console.error('Error creating dog:', error));
  };

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-left text-black mb-4 sm:mb-6">Add a New Dog Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Breed</label>
          <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Size</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Age</label>
          <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Health Issues</label>
          <input type="text" name="healthIssues" value={formData.healthIssues} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Status</label>
          <input type="text" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Demeanor</label>
          <input type="text" name="demeanor" value={formData.demeanor} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]" />
        </div>
        <div>
          <label className="block font-semibold">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"></textarea>
        </div>
        
          <button type="submit" className="w-full bg-[#8B2232] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-[#a32a3e] transition duration-300">Add Dog Profile</button>
      </form>
    </div>
  );
}
