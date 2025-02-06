import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { NewDog } from './components/dogs/NewDog';
import { DogList } from './components/dogs/DogList';
import Login from './components/Login';
import DogProfile from './components/dogs/DogProfile';

function App() {

  return (
    <Router>
      <Routes>
        <Route path = "/" element={<Home />} />
        <Route path = "/dogs" element={<DogList />} />
        <Route path="/dogs/:id" element={<DogProfile />} />
        <Route path="/new-dog" element={<NewDog />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
