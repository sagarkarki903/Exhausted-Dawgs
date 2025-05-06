import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Upload } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [breedOptions, setBreedOptions] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND;

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    try {
      // First create the dog
      const dogResponse = await axios.post(`${backendUrl}/dogs`, formData, {
        withCredentials: true
      });
      const dogId = dogResponse.data.id;

      // If there's a selected file, upload it
      if (selectedFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('image', selectedFile);

        // Upload the image
        const imageResponse = await axios.post(
          `${backendUrl}/dogs/${dogId}/upload`,
          formDataWithFile,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Set the uploaded image as the profile picture
        await axios.put(
          `${backendUrl}/dogs/${dogId}/profile-picture`,
          {
            imageUrl: imageResponse.data.imageUrl,
          },
          {
            withCredentials: true
          }
        );
      }

      navigate('/dogs');
    } catch (err) {
      console.error('Error creating dog profile:', err);
      setUploadError(err.response?.data?.error || 'Failed to create dog profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Add a New Dog Profile</h1>
      {uploadError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {uploadError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Profile Picture</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-600 hover:bg-gray-100">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or JPEG (MAX. 800x400px)</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Name</label>
          <input
            type="text" name="name" value={formData.name}
            onChange={handleChange} required
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Breed (dog.ceo) */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Breed</label>
          <Select
            options={breedOptions}
            isLoading={loadingBreeds}
            isSearchable
            onChange={handleSelect('breed')}
            value={breedOptions.find(o => o.value === formData.breed) || null}
            placeholder="Type or select a breed…"
            classNamePrefix="react-select"
            className="dark:text-gray-900"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Size</label>
          <Select
            options={sizeOptions}
            onChange={handleSelect('size')}
            value={sizeOptions.find(o => o.value === formData.size) || null}
            placeholder="Select size…"
            classNamePrefix="react-select"
            className="dark:text-gray-900"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Age</label>
          <input
            type="text" name="age" value={formData.age}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Health Issues */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Health Issues</label>
          <input
            type="text" name="healthIssues" value={formData.healthIssues}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Status for Adoption */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Status for Adoption</label>
          <Select
            options={statusOptions}
            onChange={handleSelect('status')}
            value={statusOptions.find(o => o.value === formData.status) || null}
            placeholder="Select status…"
            classNamePrefix="react-select"
            className="dark:text-gray-900"
          />
        </div>

        {/* Demeanor */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Demeanor</label>
          <Select
            options={demeanorOptions}
            onChange={handleSelect('demeanor')}
            value={demeanorOptions.find(o => o.value === formData.demeanor) || null}
            placeholder="Select demeanor…"
            classNamePrefix="react-select"
            className="dark:text-gray-900"
          />
        </div>

        {/* Zone / Section */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Zone / Section</label>
          <input
            type="number"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            min="1"
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter zone number"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200">Notes</label>
          <textarea
            name="notes" value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring focus:ring-[#8B2232] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full bg-[#8B2232] text-white font-semibold py-3 rounded-lg transition
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a32a3e]'}`}
        >
          {uploading ? 'Creating Profile...' : 'Add Dog Profile'}
        </button>
      </form>
    </div>
  );
};
