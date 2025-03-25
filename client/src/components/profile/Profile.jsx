import React, { useEffect, useState } from "react";
import { Edit, Save, X, User, Home, Phone } from "lucide-react";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/auth/profile", {
          withCredentials: true, // Ensures cookies (auth token) are sent
        });

        setUser(response.data);
        setEditedPhone(response.data.phone || ""); 
        setEditedRole(response.data.role || "");

        // ✅ Safely format date
        if (response.data.created_at) {
          const date = new Date(response.data.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          setFormattedDate(date);
        }
      } catch (err) {
        setError("Failed to load user data.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle Save (Admin Updates User)
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/auth/update-user/${user.id}`,
        { phone: editedPhone, role: editedRole },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("User updated successfully!");
        setUser({ ...user, phone: editedPhone, role: editedRole });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-5">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500 mt-5">{error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <NavUser />
      <div className="max-w-3xl mx-auto pb-10">
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">+</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {user ? `${user.firstname} ${user.lastname}` : "User"}
              </h1>

              <div className="flex flex-col space-y-2">
                {/* Email */}
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  {user ? user.email : "Email not available"}
                </div>

                {/* Phone */}
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    user?.phone || "N/A"
                  )}
                </div>

                {/* Role */}
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  {isEditing ? (
                    <select
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="User">Marshal</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    user?.role || "N/A"
                  )}
                </div>

                {/* Joined Date */}
                <div className="flex items-center text-gray-600">
                  <Home className="h-5 w-5 mr-2" />
                  Joined {formattedDate}
                </div>
              </div>

              {/* Admin Edit Button */}
              {user?.role === "Admin" && (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        className="bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center"
                        onClick={handleSave}
                      >
                        <Save className="mr-2" size={18} />
                        Save
                      </button>
                      <button
                        className="bg-gray-500 text-white px-6 py-2 rounded-md font-medium flex items-center"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2" size={18} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="bg-red-700 text-white px-6 py-2 rounded-md font-medium flex items-center"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="mr-2" size={18} />
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Tabs Section (Re-Added) */}
        <div className="flex border rounded-md mb-6">
          <button className="flex-1 py-3 px-4 font-medium bg-gray-100">Profile Details</button>
          <button className="flex-1 py-3 px-4 text-gray-600">Saved Dogs</button>
          <button className="flex-1 py-3 px-4 text-gray-600">Applications</button>
        </div>

        {/* Adoption Preferences */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <User className="mr-2" size={20} />
            Adoption Preferences
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Preferred Dog Size */}
            <div>
              <h3 className="font-medium mb-3">Preferred Dog Size</h3>
              <div className="flex gap-2">
                <span className="bg-amber-300 px-4 py-1 rounded-full text-sm">Medium</span>
                <span className="bg-amber-300 px-4 py-1 rounded-full text-sm">Large</span>
              </div>
            </div>

            {/* Preferred Dog Age */}
            <div>
              <h3 className="font-medium mb-3">Preferred Dog Age</h3>
              <div className="flex gap-2">
                <span className="bg-amber-300 px-4 py-1 rounded-full text-sm">Young</span>
                <span className="bg-amber-300 px-4 py-1 rounded-full text-sm">Adult</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
