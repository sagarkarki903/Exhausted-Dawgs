import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Heart, PawPrint } from "lucide-react";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";

export const DogList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // New state to capture favorite dog ids from the user's profile
  const [favoriteDogIds, setFavoriteDogIds] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Track user role

  // Fetch all dogs
  useEffect(() => {
    axios
      .get(`${backendUrl}/dogs`)
      .then((response) => setDogs(response.data))
      .catch((error) => console.error("Error fetching dogs:", error));
  }, [backendUrl]);

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
        <h1 className="text-3xl font-bold text-center my-6">Dog Gallery</h1>
        {(role === "Admin" || role === "Marshal") && (
          <div className="addDog flex justify-center sm:justify-end mb-6">
            <Link to="/new-dog">
              <button className="bg-[#8B2232] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#a32a3e] transition duration-300 w-full sm:w-auto">
                Add New
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(dogs) ? (
            dogs.map((dog, index) => {
              const profilePic = dog.profile_picture_url || "/dog2.jpeg";
              // Check if this dog is favorited by the user (favoriteDogIds should be an array of IDs)
              const isFavorited = favoriteDogIds.includes(dog.id);
              return (
                <motion.div
                  key={index}
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
                        className="flex-1 rounded-md w-full bg-red-900 px-4 py-2 text-white transition hover:bg-red-800"
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
            <p className="text-center text-gray-500">No dogs available or error fetching dogs.</p>
          )}
        </div>
      </div>
    </>
  );
};
