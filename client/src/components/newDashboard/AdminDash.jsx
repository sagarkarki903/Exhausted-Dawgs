import React from "react";
import { Link } from "react-router-dom";

export const AdminDash = () => {
  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <h2 className="text-4xl font-bold text-[#8B2232] mb-12 flex items-center gap-2">
        🐾 Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Marshal Report */}
        <Link
          to="/marshal-report"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          📜 View Marshal Report
        </Link>

        {/* Walker Report */}
        <Link
          to="/walker-report"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          🚶 View Walker Report
        </Link>

        {/* Past Report Summary */}
        <Link
          to="/past-report"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          📊 Past Report Summary
        </Link>

        {/* All Users */}
        <Link
          to="/admin"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          👥 View All Users
        </Link>

        {/* Organizations */}
        <Link
          to="/organizations"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          🏢 View Organizations
        </Link>

        {/* Calendar */}
        <Link
          to="/calendar-dash"
          className="bg-[#8B2232] text-white text-lg font-medium px-8 py-6 min-h-[80px] rounded-2xl shadow-lg hover:bg-[#6D1A28] hover:scale-105 transition-all duration-300 text-center flex items-center justify-center"
        >
          📅 View Calendar
        </Link>
      </div>
    </div>
  );
};
