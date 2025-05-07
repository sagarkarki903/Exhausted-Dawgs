import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { NewDog } from './components/dogs/NewDog';
import { DogList } from './components/dogs/DogList';
import DogProfile from './components/dogs/DogProfile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import LogOutTest from './LogOutTest';
import AboutP40 from './components/AboutUs/aboutP40';
import AdoptDonate from './components/AdoptionDonation/adopt_donate';
import { ContactPage } from './components/Contact/ContactPage';
import Gallery from './components/gallery/Gallery';
import RoughCalendar from './components/newDashboard/RoughCalendar';

import Profile from './components/profile/Profile';
import { AllUsers } from './components/Users/AllUsers';
import CheckinPage from './components/Checkin/CheckinPage';

import AdminDashboard from './components/dashboard/Admin';
import Walker from './components/dashboard/Walker';
import Marshal from './components/dashboard/Marshal';

import { AdminDash } from './components/newDashboard/AdminDash';
import { MarshalDash } from './components/newDashboard/MarshalDash';
import { WalkerDash } from './components/newDashboard/WalkerDash';
import { CalendarPage } from './components/newDashboard/CalendarPage';

import { MarshalReport } from './components/reports/MarshalReport';
import { WalkerReport } from './components/reports/WalkerReport';
import MainReport from './components/reports/MainReport';

import ProtectedRoute from './components/ProtectedRoute';

import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage  from "./components/ResetPasswordPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<LogOutTest />} />
        <Route path="/about" element={<AboutP40 />} />
        <Route path="/donate" element={<AdoptDonate />} />
        <Route path="/contact-page" element={<ContactPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/dogs" element={<DogList />} />
        <Route path="/dogs/:id" element={<DogProfile />} />
        <Route path="/new-dog" element={<NewDog />} />
        <Route path="/rough-calendar" element={<RoughCalendar />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkinpath"
          element={
            <ProtectedRoute>
              <CheckinPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/main-report"
          element={
            <ProtectedRoute>
              <MainReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-users"
          element={
            <ProtectedRoute>
              <AllUsers />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍🚀 Role Dashboards (can later be restricted per role) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/marshal" element={<Marshal />} />
        <Route path="/walker" element={<Walker />} />

        <Route path="/admin-dash" element={<AdminDash />} />
        <Route path="/marshal-dash" element={<MarshalDash />} />
        <Route path="/walker-dash" element={<WalkerDash />} />
        <Route path="/calendar-dash" element={<CalendarPage />} />

        {/* 📋 Reports */}
        <Route path="/marshal-report" element={<MarshalReport />} />
        <Route path="/walker-report" element={<WalkerReport />} />
      </Routes>
    </Router>
  );
}

export default App;
