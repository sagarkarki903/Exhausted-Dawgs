import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import { toast } from "react-hot-toast";

export const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({});
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [loadingNavbar, setLoadingNavbar] = useState(true);

  const usersPerPage = 12;
  const backendUrl = import.meta.env.VITE_BACKEND;

  useEffect(() => {
    fetchUsers();
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [users, roleFilter, searchTerm]);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${backendUrl}/auth/profile`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setLoggedIn(true);
        setRole(res.data.role);
      }
    } catch {
      setLoggedIn(false);
      setRole("");

    } finally {
      setLoadingNavbar(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/users`, {
        withCredentials: true,
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let temp = [...users];

    if (roleFilter !== "All") {
      temp = temp.filter((user) => user.role === roleFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (user) =>
          user.firstname.toLowerCase().includes(term) ||
          user.lastname.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.id.toString().includes(term)
      );
    }

    setFilteredUsers(temp);
    setCurrentPage(1);
  };

  const startEditing = (user) => {
    setEditUserId(user.id);
    setEditData({
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone || "",
      role: user.role,
    });
  };

  const cancelEditing = () => {
    setEditUserId(null);
    setEditData({});
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async (userId) => {
    try {
      await axios.put(`${backendUrl}/users/${userId}`, editData, {
        withCredentials: true,
      });
      setEditUserId(null);
      fetchUsers();
      toast.success("User changes saved successfully!");
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Failed to save user changes");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await axios.delete(`${backendUrl}/users/${userId}`, {
        withCredentials: true,
      });
      fetchUsers();
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      Admin: "bg-red-600",
      Marshal: "bg-blue-600",
      Walker: "bg-green-600",
    };
    return <span className={`text-white px-2 py-1 rounded text-sm ${colors[role]}`}>{role}</span>;
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      {!loadingNavbar && (
        !loggedIn ? <Navbar /> : role === "Admin" ? <NavAdmin /> : <NavUser />
      )}

      <main className="flex-1 p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center flex items-center gap-2 text-[#8B2232] mb-4">
          <span>⚙️</span> User Management
        </h2>

        <div className="w-full max-w-6xl flex flex-col md:flex-row md:justify-between items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name, username, email or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded w-full md:w-1/2"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded w-full md:w-48"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Marshal">Marshal</option>
            <option value="Walker">Walker</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : (
          <div className="overflow-x-auto w-full max-w-6xl">
            <table className="w-full bg-white shadow rounded-lg border">
              <thead className="bg-[#8B2232] text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">First Name</th>
                  <th className="p-3 text-left">Last Name</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => {
                  const isEditing = editUserId === user.id;
                  return (
                    <tr key={user.id} className="border-b">
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            value={editData.firstname}
                            onChange={(e) => handleChange("firstname", e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          user.firstname
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            value={editData.lastname}
                            onChange={(e) => handleChange("lastname", e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          user.lastname
                        )}
                      </td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            value={editData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          user.phone || "-"
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editData.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                          >
                            <option>Admin</option>
                            <option>Marshal</option>
                            <option>Walker</option>
                          </select>
                        ) : (
                          getRoleBadge(user.role)
                        )}
                      </td>
                      <td className="p-3 space-x-2 text-sm">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveChanges(user.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(user)}
                              className="border border-blue-600 text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="border border-red-600 text-red-600 px-2 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i + 1
                        ? "bg-[#8B2232] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
