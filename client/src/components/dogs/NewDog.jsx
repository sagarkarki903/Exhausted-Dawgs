import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    zone: '',
  });
  const [breedOptions, setBreedOptions] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const navigate = useNavigate();

  // 1) Fetch all breeds from dog.ceo
  useEffect(() => {
    axios.get('https://dog.ceo/api/breeds/list/all')
      .then(res => {
        const msg = res.data.message;
        const opts = [];
        Object.entries(msg).forEach(([breed, subs]) => {
          if (subs.length === 0) {
            opts.push({ value: breed, label: capitalize(breed) });
          } else {
            subs.forEach(sub => {
              opts.push({
                value: `${breed}/${sub}`,
                label: `${capitalize(sub)} ${capitalize(breed)}`,
              });
            });
          }
        });
        setBreedOptions(opts);
      })
      .catch(err => console.error('Failed to load breeds:', err))
      .finally(() => setLoadingBreeds(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'age' && !/^[0-9]*$/.test(value)) return;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSelect = (field) => option => {
    setFormData(fd => ({ ...fd, [field]: option?.value || '' }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_BACKEND;
    axios.post(`${backendUrl}/dogs`, formData)
      .then(() => navigate('/dogs'))
      .catch(err => console.error('Error creating dog:', err));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Add a New Dog Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text" name="name" value={formData.name}
            onChange={handleChange} required
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"
          />
        </div>

        {/* Breed (dog.ceo) */}
        <div>
          <label className="block font-semibold mb-1">Breed</label>
          <Select
            options={breedOptions}
            isLoading={loadingBreeds}
            isSearchable
            onChange={handleSelect('breed')}
            value={breedOptions.find(o => o.value === formData.breed) || null}
            placeholder="Type or select a breed…"
            classNamePrefix="react-select"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block font-semibold mb-1">Size</label>
          <Select
            options={sizeOptions}
            onChange={handleSelect('size')}
            value={sizeOptions.find(o => o.value === formData.size) || null}
            placeholder="Select size…"
            classNamePrefix="react-select"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block font-semibold mb-1">Age</label>
          <input
            type="text" name="age" value={formData.age}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"
          />
        </div>

        {/* Health Issues */}
        <div>
          <label className="block font-semibold mb-1">Health Issues</label>
          <input
            type="text" name="healthIssues" value={formData.healthIssues}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"
          />
        </div>

        {/* Status for Adoption */}
        <div>
          <label className="block font-semibold mb-1">Status for Adoption</label>
          <Select
            options={statusOptions}
            onChange={handleSelect('status')}
            value={statusOptions.find(o => o.value === formData.status) || null}
            placeholder="Select status…"
            classNamePrefix="react-select"
          />
        </div>

        {/* Demeanor */}
        <div>
          <label className="block font-semibold mb-1">Demeanor</label>
          <Select
            options={demeanorOptions}
            onChange={handleSelect('demeanor')}
            value={demeanorOptions.find(o => o.value === formData.demeanor) || null}
            placeholder="Select demeanor…"
            classNamePrefix="react-select"
          />
        </div>
        {/* Zone / Section */}
        <div>
          <label className="block font-semibold mb-1">Zone / Section</label>
          <input
            type="number"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            min="1"
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"
            placeholder="Enter zone number"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <textarea
            name="notes" value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#8B2232] text-white font-semibold py-3 rounded-lg hover:bg-[#a32a3e] transition"
        >
          Add Dog Profile
        </button>
      </form>
    </div>
  );
};
