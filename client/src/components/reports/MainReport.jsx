import { useEffect, useState } from "react";
import axios from "axios";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import ReactPaginate from "react-paginate";

const MainReport = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    dog: "",
    walker: "",
    checkin: ""
  });

  const [currentPage, setCurrentPage] = useState(0);
  const reportsPerPage = 15;

  useEffect(() => {
    axios.get(`${backendUrl}/auth/profile`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to fetch user:", err))
      .finally(() => setLoading(false));
  }, [backendUrl]);

  useEffect(() => {
    axios.get(`${backendUrl}/reports/all`, { withCredentials: true })
      .then((res) => {
        setReports(res.data);
        setFilteredReports(res.data);
      })
      .catch((err) => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let temp = reports;

    if (filters.dog) {
      temp = temp.filter(r => r.dog_name?.toLowerCase().includes(filters.dog.toLowerCase()));
    }

    if (filters.walker) {
      temp = temp.filter(r => r.walker?.toLowerCase().includes(filters.walker.toLowerCase()));
    }

    if (filters.checkin) {
      const isChecked = filters.checkin === "Checked In";
      temp = temp.filter(r =>
        (isChecked && r.check_in_status === "Checked In") ||
        (!isChecked && r.check_in_status !== "Checked In")
      );
    }

    setFilteredReports(temp);
    setCurrentPage(0);
  }, [filters, reports]);

  const convertToCSV = (data) => {
    const header = ["#", "Dog", "Date", "Time", "Walker", "Marshal", "Check-In"];
    const rows = data.map((report, index) => [
      index + 1,
      report.dog_name || "-",
      new Date(report.date).toLocaleDateString(),
      report.time,
      report.walker,
      report.marshal,
      report.check_in_status === "Checked In" ? "Checked In" : "Not Checked In"
    ]);
    return [header, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = () => {
    const csvContent = convertToCSV(filteredReports);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "completed_walk_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRow = async (id) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await axios.delete(`${backendUrl}/reports/${id}`, { withCredentials: true });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL reports?")) return;
    try {
      await axios.delete(`${backendUrl}/reports`, { withCredentials: true });
      setReports([]);
      setFilteredReports([]);
    } catch (err) {
      console.error("Delete all failed:", err);
      alert("Delete all failed.");
    }
  };

  const pageCount = Math.ceil(filteredReports.length / reportsPerPage);
  const offset = currentPage * reportsPerPage;
  const currentPageReports = filteredReports.slice(offset, offset + reportsPerPage);

  if (loading) return <p className="text-center mt-6 text-gray-500">Loading reports...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {user?.role === "Admin" ? <NavAdmin /> : <NavUser />}

      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-3xl font-bold mb-6">Completed Walk Reports</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter by Dog"
            value={filters.dog}
            onChange={(e) => setFilters({ ...filters, dog: e.target.value })}
            className="border px-3 py-2 rounded shadow-sm"
          />
          <input
            type="text"
            placeholder="Filter by Walker"
            value={filters.walker}
            onChange={(e) => setFilters({ ...filters, walker: e.target.value })}
            className="border px-3 py-2 rounded shadow-sm"
          />
          <select
            value={filters.checkin}
            onChange={(e) => setFilters({ ...filters, checkin: e.target.value })}
            className="border px-3 py-2 rounded shadow-sm"
          >
            <option value="">All Check-In Status</option>
            <option value="Checked In">Checked In</option>
            <option value="Not Checked In">Not Checked In</option>
          </select>
          <button
            onClick={downloadCSV}
            className="ml-auto bg-blue-600 text-white py-2 px-4 rounded"
          >
            Download CSV
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 text-white py-2 px-4 rounded"
          >
            Delete All Reports
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Dog</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Time</th>
                <th className="border px-3 py-2">Walker</th>
                <th className="border px-3 py-2">Marshal</th>
                <th className="border px-3 py-2">Check-In</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPageReports.map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{offset + idx + 1}</td>
                  <td className="border px-3 py-2">{report.dog_name || "-"}</td>
                  <td className="border px-3 py-2">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="border px-3 py-2">{report.time}</td>
                  <td className="border px-3 py-2">{report.walker}</td>
                  <td className="border px-3 py-2">{report.marshal}</td>
                  <td className="border px-3 py-2">
                    <span
                      className={
                        report.check_in_status === "Checked In"
                          ? "text-green-700 font-semibold"
                          : "text-red-500"
                      }
                    >
                      {report.check_in_status}
                    </span>
                  </td>
                  <td className="border px-3 py-2">
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => handleDeleteRow(report.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ReactPaginate
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName="flex gap-2 justify-center mt-6"
          activeClassName="bg-gray-800 text-white"
          pageClassName="px-3 py-1 border rounded"
          previousLabel="Prev"
          nextLabel="Next"
          previousClassName="px-3 py-1 border rounded"
          nextClassName="px-3 py-1 border rounded"
          disabledClassName="opacity-50 cursor-not-allowed"
        />
      </main>

      <Footer />
    </div>
  );
};

export default MainReport;
