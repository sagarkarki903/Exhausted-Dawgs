"use client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LogOutTest() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable

      await axios.post(`${backendUrl}/log-sign/logout-server`, {}, { withCredentials: true });

      // Redirect to login page after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-end items-center p-4">
      <button 
        onClick={handleLogout} 
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Log Out
      </button>
    </div>
  );
}
