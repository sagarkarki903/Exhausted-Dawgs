import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import DogList from './components/dogs/DogList';
import DogProfile from './components/dogs/DogProfile';
import NewDog from './components/dogs/NewDog';
import Login from './components/Login';
import SignUp from './components/SignUp';
import LogOutTest from './LogOutTest';
import Walker from './components/dashboard/Walker';
import Marshal from './components/dashboard/Marshal';
import MarshalDash from './components/dashboard/MarshalDash';
import WalkerDash from './components/dashboard/WalkerDash';
import CalendarPage from './components/calendar/CalendarPage';
import MarshalReport from './components/reports/MarshalReport';
import WalkerReport from './components/reports/WalkerReport';
import AllUsers from './components/users/AllUsers';
import AboutP40 from './components/AboutUs/aboutP40';
import ContactUs from './components/ContactUs/ContactUs';
import RoughCalendar from './components/calendar/RoughCalendar';
import Gallery from './components/gallery/Gallery';
import MainReport from './components/reports/MainReport';
import Profile from './components/profile/Profile';
import CheckinPage from './components/Checkin/CheckinPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppRoutes = () => {
  return (
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
      <Route path="/about" element={<AboutP40 />} />
      <Route path="/contact-page" element={<ContactUs />} />
      <Route path="/rough-calendar" element={<RoughCalendar />} />
      <Route path="/gallery" element={<Gallery />} />

      {/* Protected Routes */}
      <Route
        path="/main-report"
        element={
          <ProtectedRoute>
            <MainReport />
          </ProtectedRoute>
        }
      />
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
    </Routes>
  );
};

export default AppRoutes; 