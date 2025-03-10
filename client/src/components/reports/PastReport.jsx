import React from "react";

export const PastReport = () => {
  // Dummy data for past reports
  const pastReports = [
    {
      id: 1,
      dogName: "Buddy",
      walkerName: "John Doe",
      milesWalked: "2.5 miles",
      date: "Feb 15, 2025",
      startTime: "10:00 AM",
      endTime: "10:45 AM",
    },
    {
      id: 2,
      dogName: "Max",
      walkerName: "Emma Smith",
      milesWalked: "3.2 miles",
      date: "Feb 14, 2025",
      startTime: "9:30 AM",
      endTime: "10:20 AM",
    },
    {
      id: 3,
      dogName: "Charlie",
      walkerName: "Michael Brown",
      milesWalked: "1.8 miles",
      date: "Feb 13, 2025",
      startTime: "3:00 PM",
      endTime: "3:40 PM",
    },
    {
      id: 4,
      dogName: "Bella",
      walkerName: "Sophia Johnson",
      milesWalked: "2.0 miles",
      date: "Feb 12, 2025",
      startTime: "11:15 AM",
      endTime: "12:00 PM",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-[#8B2232] mb-6">📋 Past Walk Reports</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-[#8B2232] text-white">
              <th className="border border-gray-300 p-3">Dog Name</th>
              <th className="border border-gray-300 p-3">Walker</th>
              <th className="border border-gray-300 p-3">Miles Walked</th>
              <th className="border border-gray-300 p-3">Walk Date</th>
              <th className="border border-gray-300 p-3">Start Time</th>
              <th className="border border-gray-300 p-3">End Time</th>
            </tr>
          </thead>
          <tbody>
            {pastReports.map((report) => (
              <tr key={report.id} className="text-center">
                <td className="border border-gray-300 p-3">{report.dogName}</td>
                <td className="border border-gray-300 p-3">{report.walkerName}</td>
                <td className="border border-gray-300 p-3">{report.milesWalked}</td>
                <td className="border border-gray-300 p-3">{report.date}</td>
                <td className="border border-gray-300 p-3">{report.startTime}</td>
                <td className="border border-gray-300 p-3">{report.endTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
