import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, Heart, PawPrint } from "lucide-react";
import Select from "react-select";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { toast } from "react-hot-toast";

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  

  const toggleFilters = () => setShowMoreFilters(f => !f);

    // --- filtering & pagination state ---
  const [filters, setFilters] = useState({
    name: "",
    breed: "",
    age: "",
    status: "",
    size: "",
    demeanors: [],

  });
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 8;

  // returns the right Tailwind classes for each demeanor
const getDemeanorColor = (demeanor) => {
  switch (demeanor) {
    case "Red":
      return "bg-red-100 text-red-800 border-red-200";
    case "Gray":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Yellow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};


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


  const [breedOptions, setBreedOptions] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  // Fetch all dogs
  useEffect(() => {
    axios
      .get(`${backendUrl}/dogs`)
      .then((res) => {
        setDogs(res.data);
      })
      .catch((err) => {
        console.error("Error fetching dogs:", err);
        toast.error("Failed to fetch dogs.");
      })
      .finally(() => setLoading(false));
  }, [backendUrl]);

 useEffect(() => {
    axios
      .get(`${backendUrl}/api/breeds`)
      .then((res) => {
        const msg = res.data.message;
        const opts = [];
        Object.entries(msg).forEach(([breed, subs]) => {
          if (subs.length === 0) {
            opts.push({ value: breed, label: capitalize(breed) });
          } else {
            subs.forEach((sub) =>
              opts.push({
                value: `${breed}/${sub}`,
                label: `${capitalize(sub)} ${capitalize(breed)}`,
              })
            );
          }
        });
        setBreedOptions(opts);
      })
      .catch((err) => {
        console.error("Error fetching breeds:", err);
         toast.error("Failed to load breed list.");
      })
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
      toast.success("Favorites updated");
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Could not update favorites");
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

    const handleDemeanorCheckbox = (e) => {
    const { value, checked } = e.target;
    setFilters(f => {
      const next = checked
        ? [...f.demeanors, value]
        : f.demeanors.filter(d => d !== value);
      return { ...f, demeanors: next };
    });
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
    if (filters.demeanors.length > 0 && !filters.demeanors.includes(dog.demeanor))
    return false;
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

      {/* Demeanor checkboxes */}
      <div className="mb-2 p-4 border rounded-lg border-gray-400 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Filter by Demeanor</h2>
          <div className="flex flex-wrap gap-4">
            {/* Checkboxes for each demeanor option */}
            {[
              { value: "Red",    label: "Not Friendly but walkable",    bg: "bg-red-100 text-red-800 border-red-200"  },
              { value: "Gray",   label: "Aggressive & Unwalkable",   bg: "bg-gray-100 text-gray-800 border-gray-200"  },
              { value: "Yellow", label: "Friendly & Walkable", bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
            ].map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={filters.demeanors.includes(opt.value)}
                  onChange={handleDemeanorCheckbox}
                  className="h-4 w-4"
                />
                {/* colored circle */}
                <label htmlFor={opt.value} className="flex items-center">
                    <span className={`px-4 py-0.5 rounded-full text-sm font-medium mr-2 ${opt.bg}`}>
                     {opt.value}--<span className="text-xs">{opt.label}</span>
                    </span>
                </label>
              </div>
            ))}
          </div>
      </div>


        <div className="relative p-6 z-10 ">
        {/* FILTERS */}
        <div className="mb-6">
          
        {/* first row: search | toggle | breed */}
        <div className="flex items-center gap-2">
          {/* Search input grows to fill */}
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterInput}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={toggleFilters}
            className="p-2 bg-red-800 text-white rounded-lg shadow-md hover:bg-yellow-500 transition duration-300 cursor-pointer"
            aria-label="Show more filters"
          >
            <Filter className="h-5 w-5 text-white" />
          </button>

          {/* Always‑visible breed select */}
          <div className="w-48">
            <Select
              options={breedOptions}
              isLoading={loadingBreeds}
              isClearable
              isSearchable
              onChange={handleFilterSelect("breed")}
              value={breedOptions.find(o => o.value === filters.breed) || null}
              placeholder="All breeds"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* second row: only when toggled */}
        {showMoreFilters && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {/* Age */}
            <input
              type="number"
              name="age"
              value={filters.age}
              onChange={handleFilterInput}
              placeholder="Age"
              className="p-2 border border-gray-400 rounded w-24"
              min="0"
            />

            {/* Status */}
            <div className="w-40">
              <Select
                options={statusOptions}
                isClearable
                onChange={handleFilterSelect("status")}
                value={statusOptions.find(o => o.value === filters.status) || null}
                placeholder="All Status"
                classNamePrefix="react-select"
              />
            </div>

            {/* Size */}
            <div className="w-36">
              <Select
                options={sizeOptions}
                isClearable
                onChange={handleFilterSelect("size")}
                value={sizeOptions.find(o => o.value === filters.size) || null}
                placeholder="All Sizes"
                classNamePrefix="react-select"
              />
            </div>

          </div>
        )}
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
                       {/* name + colored demeanor badge */}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{dog.name}</h3>
                        <span
                          className={`${getDemeanorColor(dog.demeanor)} px-2 py-0.5 rounded-full text-xs font-medium border`}
                        >
                          {dog.demeanor}
                        </span>
                      </div>
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
                className="flex justify-center items-center cursor-pointer gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer "
            >
              Prev
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 border cursor-pointer rounded ${
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
              className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer "
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
