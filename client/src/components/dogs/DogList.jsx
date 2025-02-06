// components/DogList.jsx
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
    <div>
      <h1>Dog Profiles</h1>
      <Link to="/new-dog">
        <button>Add New</button>
      </Link>
      <hr></hr>
      <ul>
        {dogs.map(dog => (
          <li key={dog.id}>
            <Link to={`/dogs/${dog.id}`}>
              {dog.name} - {dog.breed}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
