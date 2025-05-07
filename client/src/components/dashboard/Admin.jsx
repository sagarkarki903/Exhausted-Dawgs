import { useEffect, useState } from 'react';
import axios from 'axios';
import LogOutTest from '../../LogOutTest';
import { toast } from "react-hot-toast";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        
        const response = await axios.get(`${backendUrl}/users`, { 
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        });
        setUsers(response.data);
        toast.success("✅ Users loaded");
      } catch {
        toast.error("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, [backendUrl]);

const editUser = async (id) => {
  const newRole = prompt("Enter new role (Admin, Marshal, Walker):");
  if (!["Admin", "Marshal", "Walker"].includes(newRole)) {
    toast.error("Invalid role.");
    return;
  }

  try {
    console.log(`Editing user ID: ${id} - New Role: ${newRole}`);

    const response = await axios.put(`${backendUrl}/users/${id}`, 
      { role: newRole }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    console.log("Edit Response:", response.data);
    toast.success("User role updated successfully.");
    window.location.reload();
  } catch (error) {
    console.error("Error editing user:", error.response?.data || error);
    toast.error("Failed to update user.");
  }
};

const deleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    console.log(`Deleting user ID: ${id}`);

    const response = await axios.delete(`${backendUrl}/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    console.log("Delete Response:", response.data);
    toast.success("User deleted successfully.");
    setUsers(users.filter(user => user.id !== id)); // Remove from state
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error);
    toast.error("Failed to delete user.");
  }
};



  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <LogOutTest />
      <table className="min-w-full bg-white shadow-md">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.firstname} {user.lastname}</td>
              <td className="border px-4 py-2">{user.username}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <button className="bg-yellow-500 px-3 py-1 mr-2" onClick={() => editUser(user.id)}>Edit</button>
                <button className="bg-red-500 px-3 py-1" onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;