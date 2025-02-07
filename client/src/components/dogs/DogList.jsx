import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const DogList = () => {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8080/dogs')
      .then(response => setDogs(response.data))
      .catch(error => console.error('Error fetching dogs:', error));
  }, []);

  return (
    <>
      <div className="p-6">
        <a href="/" className="text-sm text-black">Back to Home</a>
        <h1 className="text-3xl font-bold text-center my-6">Dog Gallery</h1>

        <div className="addDog flex justify-center sm:justify-end mb-6">
          <Link to="/new-dog">
            <button className="bg-[#8B2232] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#a32a3e] transition duration-300 w-full sm:w-auto">Add New</button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dogs.map((dog, index) => (
            <div key={index} className="border rounded-lg shadow-lg p-4 relative">
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image</span>
              </div>
              {/* <button className="absolute top-2 right-2 bg-yellow-400 p-2 rounded-full">❤️</button> */}
              <h2 className="text-lg font-semibold mt-4">{dog.name}</h2>
              <p className="text-gray-600">{dog.breed}</p>
              <p className="text-gray-500 text-sm">Age: {dog.age} years</p>
              <Link to={`/dogs/${dog.id}`}>
                <button className="mt-4 w-full bg-[#8B2232] text-white py-2 rounded-md">Learn More</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
