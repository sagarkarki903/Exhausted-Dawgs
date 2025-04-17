import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Filter } from "lucide-react";
import Select from "react-select";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const DogAssignModal = ({ isOpen, onClose }) => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [dogs, setDogs] = useState([]);
  const [filters, setFilters] = useState({ name: "", breed: "", demeanor: "" });
  const [breedOptions, setBreedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 8;

  const demeanorOptions = [
    { value: "Red", label: "Red (Not Friendly but walkable)" },
    { value: "Gray", label: "Gray (Aggressive & Unwalkable)" },
    { value: "Yellow", label: "Yellow (Friendly & Walkable)" },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const fetchDogs = async () => {
      try {
        const res = await axios.get(`${backendUrl}/dogs`);
        setDogs(res.data);
      } catch (err) {
        console.error("Error fetching dogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, [isOpen, backendUrl]);

  useEffect(() => {
    axios.get("https://dog.ceo/api/breeds/list/all")
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
      .catch(err => console.error(err));
  }, []);

  const handleFilterInput = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
    setCurrentPage(1);
  };

  const handleFilterSelect = (field) => (option) => {
    setFilters((f) => ({ ...f, [field]: option?.value || "" }));
    setCurrentPage(1);
  };

  const filteredDogs = dogs.filter((dog) => {
    if (filters.name && !dog.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.breed && dog.breed !== filters.breed) return false;
    if (filters.demeanor && dog.demeanor !== filters.demeanor) return false;
    return true;
  });

  const indexOfLast = currentPage * dogsPerPage;
  const indexOfFirst = indexOfLast - dogsPerPage;
  const currentDogs = filteredDogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDogs.length / dogsPerPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assign Dogs</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterInput}
            placeholder="Search by name..."
            className="flex-1 min-w-[200px] border px-3 py-2 rounded shadow-sm"
          />

          <div className="w-64">
            <Select
              options={breedOptions}
              isClearable
              isSearchable
              onChange={handleFilterSelect("breed")}
              value={breedOptions.find(o => o.value === filters.breed) || null}
              placeholder="All breeds"
              classNamePrefix="react-select"
            />
          </div>

          <div className="w-64">
            <Select
              options={demeanorOptions}
              isClearable
              onChange={handleFilterSelect("demeanor")}
              value={demeanorOptions.find(o => o.value === filters.demeanor) || null}
              placeholder="All Demeanors"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Dog Cards */}
        {loading ? (
          <p className="text-center text-gray-500">Loading dogs...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentDogs.map((dog) => (
              <div
                key={dog.id}
                className="rounded-lg border shadow-sm overflow-hidden"
              >
                <img
                  src={dog.profile_picture_url || "/dog2.jpeg"}
                  alt={dog.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => (e.target.src = "/dog2.jpeg")}
                />
                <div className="p-3">
                  <h2 className="text-lg font-semibold">{dog.name}</h2>
                  <p className="text-gray-600">{dog.breed}</p>
                  <p className="text-gray-500 text-sm">Age: {dog.age} years</p>
                  <button className="mt-2 w-full bg-red-900 text-white py-1 rounded hover:bg-red-800">
                    Assign Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 border rounded ${
                  num === currentPage ? "bg-gray-800 text-white" : "hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DogAssignModal;