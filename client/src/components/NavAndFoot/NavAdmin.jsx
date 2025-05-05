"use client";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react"; // Import an icon
import axios from "axios";


export const NavAdmin = () => {

    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const desktopDropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable


    // 🔐 Fetch user info
    useEffect(() => {
     const fetchUser = async () => {
       try {
         const res = await axios.get(`${backendUrl}/auth/profile`, {
           withCredentials: true,
         });
         if (res.status === 200) {
           setUser(res.data);
         }
       } catch (error) {
         console.error("Failed to fetch user:", error);
       }
     };
   
     fetchUser();
   }, []);
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          desktopDropdownRef.current &&
          !desktopDropdownRef.current.contains(event.target)
        ) {
          setDesktopDropdownOpen(false);
        }
        if (
          mobileDropdownRef.current &&
          !mobileDropdownRef.current.contains(event.target)
        ) {
          setMobileDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    // Logout Function
    const handleLogout = async () => {
      console.log("🔹 Logout button clicked");
  
      try {
        const response = await axios.post(
          `${backendUrl}/log-sign/logout-server`,
          {},
          { withCredentials: true }
        );
  
        console.log("✅ Logout response:", response);
  
        if (response.status === 200) {
          console.log("✅ Logout successful!");
          setDesktopDropdownOpen(false);
          setMobileDropdownOpen(false);
          navigate("/login");
        } else {
          console.error("❌ Logout failed:", response);
        }
      } catch (error) {
        console.error("❌ Logout error:", error);
      }
    };

  return (
  <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <img
            src="/thumbnail_ulm_p40_underdogs_icon_ii_color_2024.png"
            alt="Underdogs Logo"
            className="w-10 h-10"
          />
          <img
            src="/thumbnail_ulm_p40_underdogs_wordmark_color_2024.png"
            alt="Underdogs"
            className="hidden sm:block w-28"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/">Home</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/all-users">Users</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/dogs">Dogs</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/gallery">Gallery</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/rough-calendar">Schedule</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/checkinpath">All Walks</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/main-report">Reports</Link>
          {/* <Link className="font-semibold hover:text-red-900 transition-colors" to="/my-walks">My Walks</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/adopt">Adopt</Link> */}

          {/* Profile Dropdown (Desktop) */}
          <div className="relative" ref={desktopDropdownRef}>
          <button
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  className="cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100"
                >
                  {user?.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gray-500 w-6 h-6" />
                  )}
              </button>

            {/* Dropdown Menu */}
            {desktopDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 border border-gray-300"
                onClick={(e) => e.stopPropagation()} // Prevent premature closing
              >
                <Link to="/profile">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    Profile
                  </button>
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation (Profile image replaces hamburger menu) */}
        <div className="md:hidden relative" ref={mobileDropdownRef}>
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300"
          >
           {user?.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gray-500 w-6 h-6" />
                  )}
          </button>

          {/* Dropdown Menu (Mobile) */}
          {mobileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 border border-gray-300"
              onClick={(e) => e.stopPropagation()} // Prevent premature closing
            >
              <Link to="/">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Home
                </button>
              </Link>
              <Link to="/#">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Users
                </button>
              </Link>
              <Link to="/dogs">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Dogs
                </button>
              </Link>
              <Link to="/#">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Gallery
                </button>
              </Link>
              <Link to="/rough-calendar">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Schedule
                </button>
              </Link>
              
              <Link to="/checkinpath">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  All Walks
                </button>
              </Link>

              <Link to="/main-report">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Reports
                </button>
              </Link>
              
              <Link to="/profile">
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                  Profile
                </button>
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
