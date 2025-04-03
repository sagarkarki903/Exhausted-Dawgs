import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Heart, PawPrint, MoveLeft } from "lucide-react";

export const DogList = () => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
    
    axios
      .get(`${backendUrl}/dogs`) // Fetch dog data including profile_picture
      .then((response) => setDogs(response.data))
      .catch((error) => console.error("Error fetching dogs:", error));

  }, []);
  console.log(dogs)
  return (
    <>
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
        <motion.div
          className="flex gap-4 my-4 text-black px-4 py-2 w-56 items-center"
          whileHover={{ scale: 1.03 }}
        >
          <MoveLeft />
          <Link to="/" className="font-semibold text-xl hover:text-red-900">
            Back to Home
          </Link>
        </motion.div>
        <h1 className="text-3xl font-bold text-center my-6">Dog Gallery</h1>

        <div className="addDog flex justify-center sm:justify-end mb-6">
          <Link to="/new-dog">
            <button className="bg-[#8B2232] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#a32a3e] transition duration-300 w-full sm:w-auto">
              Add New
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.isArray(dogs) ? (
  dogs.map((dog, index) => {
    const profilePic = dog.profile_picture_url || "/dog2.jpeg";
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
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-yellow-500"
              aria-label="Add to favorites"
            >
              <Heart className="h-5 w-5" />
            </button>
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
