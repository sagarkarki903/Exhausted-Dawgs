import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { NewDog } from './components/dogs/NewDog';
import { DogList } from './components/dogs/DogList';
import Login from './components/Login';
import SignUp from './components/Signup';
import DogProfile from './components/dogs/DogProfile';
import LogOutTest from './LogOutTest';
import AdminDashboard from './components/dashboard/Admin';
import AdminRoute from "./AdminRoute";


function App() {

  return (
    <Router>
      <Routes>
        <Route path = "/" element={<Home />} />
        <Route path = "/dogs" element={<DogList />} />
        <Route path="/dogs/:id" element={<DogProfile />} />
        <Route path="/new-dog" element={<NewDog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<LogOutTest />} />
        {/* Protected Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
