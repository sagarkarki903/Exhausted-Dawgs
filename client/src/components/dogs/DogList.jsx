import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, PawPrint } from "lucide-react";
import Select from "react-select";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const DogList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const navigate = useNavigate();

  // --- data & auth state ---
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteDogIds, setFavoriteDogIds] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Track user role

    // --- filtering & pagination state ---
  const [filters, setFilters] = useState({
    name: "",
    breed: "",
    age: "",
    status: "",
    size: "",
    demeanor: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 8;

// select‑options
  const sizeOptions = [
    { value: "Small",  label: "Small"   },
    { value: "Medium", label: "Medium"  },
    { value: "Large",  label: "Large"   },
    { value: "XLarge", label: "X‑Large" },
  ];
  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Pending",   label: "Pending"   },
    { value: "Adopted",   label: "Adopted"   },
    { value: "Fostered",  label: "Fostered"  },
  ];
  const demeanorOptions = [
    { value: "Red",    label: "Red (Not Friendly but walkable)" },
    { value: "Gray",   label: "Gray (Aggressive & Unwalkable)" },
    { value: "Yellow", label: "Yellow (Friendly & Walkable)"  },
  ];

  const [breedOptions, setBreedOptions] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  // Fetch all dogs
  useEffect(() => {
    axios
      .get(`${backendUrl}/dogs`)
      .then((response) => setDogs(response.data))
      .catch((error) => console.error("Error fetching dogs:", error));
  }, [backendUrl]);

  // fetch dog.ceo breed list once
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
      .catch(err => console.error(err))
      .finally(() => setLoadingBreeds(false));
  }, []);

  // Check if a user is logged in and fetch profile (including favorites)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
          // Parse favorite from user's profile (favorite is stored as a JSON string)
          let favArray = [];
          if (res.data.favorite) {
            try {
              favArray = JSON.parse(res.data.favorite);
              if (!Array.isArray(favArray)) {
                favArray = [];
              }
            } catch (parseError) {
              console.error("Error parsing favorites:", parseError);
            }
          }
          setFavoriteDogIds(favArray);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setLoggedIn(false);
        setRole("");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [backendUrl]);

  // Toggle a dog's favorite status
  const handleFavorite = async (dogId) => {
    try {
      const res = await axios.put(
        `${backendUrl}/auth/favorite`,
        { dogId },
        { withCredentials: true }
      );
      console.log("Favorites updated:", res.data.favorites);
      // Update the local favoriteDogIds state with the updated favorites returned by the server
      setFavoriteDogIds(res.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // filter change
  const handleFilterInput = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
    setCurrentPage(1);
  };

  // react‑select filter handler
  const handleFilterSelect = (field) => (option) => {
    setFilters(f => ({ ...f, [field]: option?.value || "" }));
    setCurrentPage(1);
  };


  /// apply all filters
  const filteredDogs = dogs.filter(dog => {
    if (filters.name && !dog.name.toLowerCase().includes(filters.name.toLowerCase()))
      return false;
    if (filters.breed && dog.breed !== filters.breed) return false;
    if (filters.age && dog.age.toString() !== filters.age) return false;
    if (filters.status && dog.status !== filters.status) return false;
    if (filters.size && dog.size !== filters.size) return false;
    if (filters.demeanor && dog.demeanor !== filters.demeanor) return false;
    return true;
  });

  // pagination logic
  const indexOfLast = currentPage * dogsPerPage;
  const indexOfFirst = indexOfLast - dogsPerPage;
  const currentDogs = filteredDogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDogs.length / dogsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {loading ? null : (
        !loggedIn ? <Navbar /> : role === "Admin" ? <NavAdmin /> : <NavUser />
      )}

      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute z-2 text-gray-400"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            animate={{
              y: [0, 10, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <PawPrint />
          </motion.div>
        ))}
      </motion.div>

      <div className="relative p-6 z-10">
        <h1 className="text-3xl font-bold text-center my-6">Meet Our Pups</h1>
        {(role === "Admin" || role === "Marshal") && (
          <div className="addDog flex justify-center sm:justify-end mb-6">
            <Link to="/new-dog">
              <button className="bg-[#8B2232] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#a32a3e] transition duration-300 w-full sm:w-auto">
                Add New
              </button>
            </Link>
          </div>
        )}
        <div className="relative p-6 z-10">
        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {/* Name & Age */}
          <input
            name="name"
            value={filters.name}
            onChange={handleFilterInput}
            placeholder="Name"
            className="p-2 border rounded"
          />
          <input
            name="age"
            type="number"
            value={filters.age}
            onChange={handleFilterInput}
            placeholder="Age"
            className="p-2 border rounded w-24"
            min="0"
          />

          {/* Breed */}
          <Select
            options={breedOptions}
            isLoading={loadingBreeds}
            isClearable
            onChange={handleFilterSelect("breed")}
            value={breedOptions.find(o=>o.value===filters.breed)||null}
            placeholder="All Breeds"
            className="w-48"
            classNamePrefix="react-select"
          />

          {/* Status */}
          <Select
            options={statusOptions}
            isClearable
            onChange={handleFilterSelect("status")}
            value={statusOptions.find(o=>o.value===filters.status)||null}
            placeholder="All Status"
            className="w-40"
            classNamePrefix="react-select"
          />

          {/* Size */}
          <Select
            options={sizeOptions}
            isClearable
            onChange={handleFilterSelect("size")}
            value={sizeOptions.find(o=>o.value===filters.size)||null}
            placeholder="All Sizes"
            className="w-36"
            classNamePrefix="react-select"
          />

          {/* Demeanor */}
          <Select
            options={demeanorOptions}
            isClearable
            onChange={handleFilterSelect("demeanor")}
            value={demeanorOptions.find(o=>o.value===filters.demeanor)||null}
            placeholder="All Demeanors"
            className="w-48"
            classNamePrefix="react-select"
          />
        </div>
        
        <div className="relative" style={{ minHeight: '600px' }}>
        <AnimatePresence mode="wait">
        <motion.div
                  key={currentPage + JSON.stringify(filters)}
                  initial={{ opacity: 0}}
                  animate={{ opacity: 1}}
                  exit={{ opacity: 0}}
                  transition={{ duration: 0.3 }} 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(currentDogs) ? (
            currentDogs.map((dog, index) => {
              const profilePic = dog.profile_picture_url || "/dog2.jpeg";
              // Check if this dog is favorited by the user (favoriteDogIds should be an array of IDs)
              const isFavorited = favoriteDogIds.includes(dog.id);
              return (
                <motion.div
                  key={index}
                  layout                                
                  className="rounded-lg border border-gray-300 shadow-md transition-shadow hover:shadow-2xl"
                  whileHover={{ scale: 1.03 }}
                >
                  <img
                    src={profilePic}
                    alt={dog.name}
                    className="h-70 w-full object-cover rounded-t-lg mx-auto"
                    onError={(e) => (e.target.src = "/dog2.jpeg")}
                  />
                  <div className="flex flex-col gap-4 p-4">
                    <div>
                      <h2 className="text-lg font-semibold mt-4">{dog.name}</h2>
                      <p className="text-gray-600">{dog.breed}</p>
                      <p className="text-gray-500 text-sm">Age: {dog.age} years</p>
                    </div>
                    <div className="flex p-4 gap-6">
                      <button
                        className="flex-1 rounded-md w-full bg-red-900 px-4 py-2 text-white transition hover:bg-red-800 hover:cursor-pointer"
                        onClick={() => navigate(`/dogs/${dog.id}`)}
                      >
                        Meet Me
                      </button>
                      {loggedIn && (
                        <button
                          onClick={() => handleFavorite(dog.id)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition ${isFavorited ? "bg-yellow-500 hover:bg-white" : "bg-white hover:bg-yellow-500"}`}
                          aria-label="Toggle favorite"
                        >
                          <Heart className="h-5 w-5"  />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No dogs found.</p>
          )}
        </motion.div>
        </AnimatePresence>
        </div>
        {/* Pagination */}
        <AnimatePresence exitBeforeEnter>
        {totalPages > 1 && (
          <motion.div 
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 border rounded ${
                  num === currentPage
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      </div>
    
    </>
  );
};
