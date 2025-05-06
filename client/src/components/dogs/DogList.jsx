import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, Heart, PawPrint } from "lucide-react";
import Select from "react-select";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const sizeOptions = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
  { value: "XLarge", label: "X‑Large" },
];
const statusOptions = [
  { value: "Available", label: "Available" },
  { value: "Pending", label: "Pending" },
  { value: "Adopted", label: "Adopted" },
  { value: "Fostered", label: "Fostered" },
];

const demeanorOptions = [
  { value: "Red", label: "Not Friendly but walkable" },
  { value: "Yellow", label: "Friendly & Walkable" },
  { value: "Gray", label: "Aggressive & Unwalkable" }
];

const getDemeanorColor = (demeanor) => {
  const base = "px-2 py-0.5 rounded-full border text-xs font-semibold";
  switch (demeanor) {
    case "Red": return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300`;
    case "Yellow": return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300`;
    case "Gray": return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300`;
    default: return `${base} bg-gray-50 text-gray-700 border-gray-200`;
  }
};

export const DogList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const navigate = useNavigate();

  const [dogs, setDogs] = useState([]);
  const [breedOptions, setBreedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [favoriteDogIds, setFavoriteDogIds] = useState([]);

  const [filters, setFilters] = useState({
    name: "", breed: "", size: "", status: "", demeanors: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 8;

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

  // Filter logic
  const filteredDogs = dogs.filter(dog => {
    return (!filters.name || dog.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.breed || dog.breed === filters.breed) &&
      (!filters.size || dog.size === filters.size) &&
      (!filters.status || dog.status === filters.status) &&
      (filters.demeanors.length === 0 || filters.demeanors.includes(dog.demeanor));
  });

  const indexOfLast = currentPage * dogsPerPage;
  const currentDogs = filteredDogs.slice(indexOfLast - dogsPerPage, indexOfLast);

  const handleFavorite = async (dogId) => {
    try {
      const res = await axios.put(
        `${backendUrl}/auth/favorite`,
        { dogId },
        { withCredentials: true }
      );
      console.log("Favorites updated:", res.data.favorites);
      setFavoriteDogIds(res.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-700">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        {loading ? null : (
          !loggedIn ? <Navbar /> : role === "Admin" ? <NavAdmin /> : <NavUser />
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute z-2 text-gray-400/30"
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

        {/* Header Section */}
        <motion.div
          className="relative z-10 text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
            Meet Our Pups
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our wonderful dogs looking for their forever homes. Each one has a unique personality and story to share.
          </p>
        </motion.div>

        {/* Admin Controls */}
        {(role === "Admin" || role === "Marshal") && (
          <motion.div 
            className="flex justify-center sm:justify-end mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/new-dog">
              <motion.button 
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add New
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div 
          className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 relative z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <Select
              options={breedOptions}
              placeholder="All breeds"
              value={breedOptions.find(o => o.value === filters.breed) || null}
              onChange={(opt) => handleFilterChange("breed", opt?.value || "")}
              className="min-w-[200px]"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderColor: 'rgb(209 213 219)',
                  '&:hover': { borderColor: 'rgb(156 163 175)' }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'rgb(31 41 55)',
                  color: 'white'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgb(55 65 81)' }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                }),
                input: (base) => ({
                  ...base,
                  color: 'white'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgb(156 163 175)'
                })
              }}
            />

            <Select
              options={sizeOptions}
              placeholder="Size"
              value={sizeOptions.find(o => o.value === filters.size) || null}
              onChange={(opt) => handleFilterChange("size", opt?.value || "")}
              className="min-w-[150px]"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderColor: 'rgb(209 213 219)',
                  '&:hover': { borderColor: 'rgb(156 163 175)' },
                  minWidth: '150px'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'rgb(31 41 55)',
                  color: 'white',
                  zIndex: 99999,
                  width: '200px',
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  marginTop: '4px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgb(55 65 81)' },
                  cursor: 'pointer',
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }),
                input: (base) => ({
                  ...base,
                  color: 'white'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgb(156 163 175)'
                }),
                menuList: (base) => ({
                  ...base,
                  padding: '4px',
                  backgroundColor: 'rgb(31 41 55)',
                  color: 'white',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: 'white',
                  '&:hover': {
                    color: 'rgb(156 163 175)'
                  }
                }),
                clearIndicator: (base) => ({
                  ...base,
                  color: 'white',
                  '&:hover': {
                    color: 'rgb(156 163 175)'
                  }
                }),
                container: (base) => ({
                  ...base,
                  minWidth: '150px',
                  position: 'relative'
                })
              }}
            />

              <Select
                options={statusOptions}
              placeholder="Status"
                value={statusOptions.find(o => o.value === filters.status) || null}
              onChange={(opt) => handleFilterChange("status", opt?.value || "")}
              className="min-w-[150px]"
                classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderColor: 'rgb(209 213 219)',
                  '&:hover': { borderColor: 'rgb(156 163 175)' }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'rgb(31 41 55)',
                  color: 'white'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgb(55 65 81)' }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                }),
                input: (base) => ({
                  ...base,
                  color: 'white'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgb(156 163 175)'
                })
              }}
              />
            </div>

          {/* Demeanor Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            {demeanorOptions.map(opt => (
              <motion.label
                key={opt.value}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={filters.demeanors.includes(opt.value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleFilterChange("demeanors",
                      checked ? [...filters.demeanors, opt.value] :
                        filters.demeanors.filter(d => d !== opt.value));
                  }}
                  className="form-checkbox h-4 w-4 text-cyan-600"
                />
                <span className={getDemeanorColor(opt.value)}>{opt.value}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{opt.label}</span>
              </motion.label>
            ))}
          </div>
        </motion.div>
      
        {/* Dogs Grid */}
        <div className="relative min-h-[600px] mb-8">
        <AnimatePresence mode="wait">
            {currentDogs.length > 0 ? (
        <motion.div
                  key={currentPage + JSON.stringify(filters)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {currentDogs.map((dog, index) => (
                <motion.div
                    key={dog.id}
                  layout                                
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden group"
                  whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <div className="relative h-64 overflow-hidden">
                      <motion.img
                        src={dog.profile_picture_url || "/dog2.jpeg"}
                    alt={dog.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        onError={(e) => {
                          console.error(`Failed to load image for ${dog.name}:`, e.target.src);
                          e.target.src = "/dog2.jpeg";
                        }}
                        onLoad={() => console.log(`Successfully loaded image for ${dog.name}:`, dog.profile_picture_url)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <motion.span 
                          className={`${getDemeanorColor(dog.demeanor)} px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm shadow-lg`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {dog.demeanor}
                        </motion.span>
                      </div>
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-white text-xl font-bold mb-1">{dog.name}</h3>
                        <p className="text-white/90 text-sm">{dog.breed}</p>
                      </motion.div>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{dog.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{dog.breed}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Age: {dog.age} years</p>
                      </div>
                      <div className="flex gap-4">
                        <motion.button
                          className="flex-1 relative h-12 overflow-hidden rounded-xl shadow-lg group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/dogs/${dog.id}`)}
                      >
                          {/* Background gradient */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-600"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          />
                          
                          {/* Hover overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                          />
                          
                          {/* Button content */}
                          <motion.div
                            className="relative h-full flex items-center justify-center gap-2 px-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className="flex items-center gap-2"
                              animate={{
                                scale: [1, 1.02, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <PawPrint className="h-5 w-5 text-white" />
                              <span className="text-white font-semibold">Meet Me</span>
                            </motion.div>
                          </motion.div>
                        </motion.button>
                      {loggedIn && (
                          <motion.button
                          onClick={() => handleFavorite(dog.id)}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 transition-all duration-300 ${
                              favoriteDogIds.includes(dog.id)
                                ? "bg-yellow-500 text-white hover:bg-white hover:text-yellow-500" 
                                : "bg-white text-gray-500 hover:bg-yellow-500 hover:text-white"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          aria-label="Toggle favorite"
                        >
                            <Heart className="h-5 w-5" />
                          </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center text-gray-500 dark:text-gray-400 py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No dogs found matching your criteria.
              </motion.div>
            )}
        </AnimatePresence>
        </div>

        {/* Pagination */}
        {filteredDogs.length > dogsPerPage && (
          <motion.div 
            className="flex justify-center items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-300 ${
                currentPage === 1 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-xl'
              }`}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              Previous
            </motion.button>

            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {Math.ceil(filteredDogs.length / dogsPerPage)}
            </span>

            <motion.button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDogs.length / dogsPerPage)))}
              disabled={currentPage === Math.ceil(filteredDogs.length / dogsPerPage)}
              className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-300 ${
                currentPage === Math.ceil(filteredDogs.length / dogsPerPage)
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-xl'
              }`}
              whileHover={currentPage !== Math.ceil(filteredDogs.length / dogsPerPage) ? { scale: 1.05 } : {}}
              whileTap={currentPage !== Math.ceil(filteredDogs.length / dogsPerPage) ? { scale: 0.95 } : {}}
            >
              Next
            </motion.button>
          </motion.div>
        )}
      </div>
      </div>
  );
};
