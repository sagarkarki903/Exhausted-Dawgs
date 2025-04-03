import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";

const MainReport = () => {
  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user info
  useEffect(() => {
    axios.get(`${backendUrl}/auth/profile`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  // Fetch reports
  useEffect(() => {
    axios.get(`${backendUrl}/reports/all`, { withCredentials: true })
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-6 text-gray-500">Loading reports...</p>;

  // Convert JSON to CSV
  const convertToCSV = (data) => {
    const header = ["#", "Date", "Time", "Dog", "Walker", "Marshal", "Status", "Check-In"];
    const rows = data.map((report, index) => [
      index + 1,
      new Date(report.date).toLocaleDateString(),
      report.time,
      report.dog,
      report.walker,
      report.marshal,
      report.status,
      report.check_in_status ? "Checked In" : "Not Checked In"
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    return csvContent;
  };

  // Download the CSV file
  const downloadCSV = () => {
    const csvContent = convertToCSV(reports);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "completed_walk_reports.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {user?.role === "Admin" ? <NavAdmin /> : <NavUser />}

      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-3xl font-bold mb-6">Completed Walk Reports</h1>

        {reports.length === 0 ? (
          <p className="text-gray-600">No reports available.</p>
        ) : (
          <div>
            <button
              onClick={downloadCSV}
              className="mb-6 bg-blue-600 text-white py-2 px-6 rounded-md"
            >
              Download CSV
            </button>

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-3 py-2">#</th>
                    <th className="border px-3 py-2">Date</th>
                    <th className="border px-3 py-2">Time</th>
                    <th className="border px-3 py-2">Dog</th>
                    <th className="border px-3 py-2">Walker</th>
                    <th className="border px-3 py-2">Marshal</th>
                    <th className="border px-3 py-2">Status</th>
                    <th className="border px-3 py-2">Check-In</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{idx + 1}</td>
                      <td className="border px-3 py-2">{new Date(report.date).toLocaleDateString()}</td>
                      <td className="border px-3 py-2">{report.time}</td>
                      <td className="border px-3 py-2">{report.dog}</td>
                      <td className="border px-3 py-2">{report.walker}</td>
                      <td className="border px-3 py-2">{report.marshal}</td>
                      <td className="border px-3 py-2 text-green-600 font-medium">{report.status}</td>
                      <td className="border px-3 py-2">
                        {report.check_in_status ? (
                          <span className="text-green-700 font-semibold">Checked In</span>
                        ) : (
                          <span className="text-red-500">Not Checked In</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MainReport;
