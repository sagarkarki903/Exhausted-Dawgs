import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { NewDog } from './components/dogs/NewDog';
import { DogList } from './components/dogs/DogList';
import Login from './components/Login';
import SignUp from './components/SignUp';
import DogProfile from './components/dogs/DogProfile';
import LogOutTest from './LogOutTest';
import AdminDashboard from './components/dashboard/Admin';
import AdminRoute from "./AdminRoute";
import Walker from './components/dashboard/Walker';
import Marshal from './components/dashboard/Marshal';
import { MarshalDash } from './components/newDashboard/MarshalDash';
import { WalkerDash } from './components/newDashboard/WalkerDash';
import { CalendarPage } from './components/newDashboard/CalendarPage';
import { MarshalReport } from './components/reports/MarshalReport';
import { WalkerReport } from './components/reports/WalkerReport';
import { AdminDash } from './components/newDashboard/AdminDash';
import { AllUsers } from './components/Users/AllUsers';
import { RoughCalendar } from './components/newDashboard/RoughCalendar';
import AboutP40 from "./components/AboutUs/aboutP40";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dogs" element={<DogList />} />
        <Route path="/dogs/:id" element={<DogProfile />} />
        <Route path="/new-dog" element={<NewDog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<LogOutTest />} />
        <Route path="/walker" element={<Walker />} />
        <Route path="/marshal" element={<Marshal />} />

        <Route path="/marshal-dash" element={<MarshalDash />} />
        <Route path="/walker-dash" element={<WalkerDash />} />
        <Route path="/calendar-dash" element={<CalendarPage />} />

        <Route path="/marshal-report" element={<MarshalReport />} />
        <Route path="/walker-report" element={<WalkerReport />} />
        <Route path="/all-users" element={<AllUsers />} />
        <Route path="/rough-calendar" element={<RoughCalendar />} />

        {/* About P40 Route */}
        <Route path="/aboutP40" element={<AboutP40 />} />  

        {/* Protected Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dash" element={<AdminDash />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
