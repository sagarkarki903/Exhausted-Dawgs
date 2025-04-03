import React, { useEffect, useState } from "react";
import { Edit, Save, X, User, Home, Phone } from "lucide-react";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";

import axios from "axios";



const Profile = () => {
  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = first tab, 1 = second, etc.
  const [upcomingWalks, setUpcomingWalks] = useState([]);
  const [myWalks, setMyWalks] = useState([]);
  const [marshalSessions, setMarshalSessions] = useState([]);
  




  useEffect(() => {
    if (user?.role === "Admin") {
      axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      })
      .then((res) => setUpcomingWalks(res.data))
      .catch((err) => console.error("Error fetching upcoming walks:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "Walker") {
      axios.get(`${backendUrl}/reports/walker/my-walks`, {
        withCredentials: true,
      })
      .then((res) => setMyWalks(res.data))
      .catch((err) => console.error("Error fetching walker's walks:", err));
    }
  }, [user]);
  
  useEffect(() => {
    if (user?.role === "Marshal") {
      axios.get(`${backendUrl}/reports/marshal/my-walks`, {
        withCredentials: true,
      })
      .then((res) => setMarshalSessions(res.data))
      .catch((err) => console.error("Error fetching marshal walks:", err));
    }
  }, [user]);
  
  


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });

        setUser(response.data);
        setEditedPhone(response.data.phone || "");
        setEditedRole(response.data.role || "");

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


  


  //handles walker check in
  const handleCheckIn = async (scheduleId) => {
    const code = prompt("Enter the check-in code:");
  
    if (!code) return;
  
    try {
      const response = await axios.put(
        `${backendUrl}/reports/walker/check-in/${scheduleId}`,
        { code },
        { withCredentials: true }
      );
  
      alert(response.data.message);
  
      // Refresh the myWalks list
      const res = await axios.get(`${backendUrl}/reports/walker/my-walks`, {
        withCredentials: true,
      });
      setMyWalks(res.data);
    } catch (err) {
      console.error("Check-in failed:", err);
      alert(err.response?.data?.message || "Failed to check in.");
    }
  };
  

  const handleCompleteWalk = async (sessionId) => {
    if (!window.confirm("Are you sure you want to complete this walk?")) return;
  
    try {
      const response = await axios.post(
        `${backendUrl}/reports/complete-walk/${sessionId}`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
  
      // Refresh data
      if (user?.role === "Admin") {
        const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
          withCredentials: true
        });
        setUpcomingWalks(res.data);
      } else if (user?.role === "Marshal") {
        const res = await axios.get(`${backendUrl}/reports/marshal/my-walks`, {
          withCredentials: true
        });
        setMarshalSessions(res.data);
      }
    } catch (err) {
      console.error("Error completing walk:", err);
      alert("Failed to complete walk.");
    }
  };
  





  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/auth/update-user/${user.id}`,
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

  
  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = window.confirm("Are you sure you want to cancel this session? This will cancel all the walks for this session.");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${backendUrl}/reports/delete-session/${sessionId}`, {
        withCredentials: true,
      });
  
      alert("Session deleted successfully.");
  
      // Refresh relevant data
      if (user.role === "Admin") {
        const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
          withCredentials: true,
        });
        setUpcomingWalks(res.data);
      } else if (user.role === "Marshal") {
        const res = await axios.get(`${backendUrl}/reports/marshal/my-walks`, {
          withCredentials: true,
        });
        setMarshalSessions(res.data);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      alert(err.response?.data?.message || "Failed to delete session.");
    }
  };
  

  //helper function
  const SessionCard = ({ session, isAdminOrMarshal }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <p className="text-gray-700"><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
      <p className="text-gray-700"><strong>Time:</strong> {session.time}</p>
      <p className="text-gray-700"><strong>Marshal:</strong> {session.marshal_name}</p>
  
      <div className="mt-2">
        <p className="font-semibold text-gray-800 mb-2">Walkers & Dogs</p>
        {session.walkers.length === 0 ? (
          <p className="text-gray-500 italic">No walkers booked yet.</p>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-gray-600 font-semibold border-b">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Walker</th>
                <th className="py-1">Dog</th>
              </tr>
            </thead>
            <tbody>
              {session.walkers.map((w, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="py-1 pr-2">{i + 1}</td>
                  <td className="py-1 pr-2">{w.walker_name}</td>
                  <td className="py-1">{w.dog_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
  
      {isAdminOrMarshal && (
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm"
            onClick={() => handleCompleteWalk(session.session_id)}
            >
            Complete Walk
          </button>
          <button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm"
            onClick={() => handleDeleteSession(session.session_id)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
  
  

  const renderTabContent = () => {
    if (user?.role === "Admin") {
      switch (activeTab) {
        case 0:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">All Upcoming Walks</h2>
              {upcomingWalks.length === 0 ? (
                <p>No upcoming walks scheduled.</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingWalks.map((session, idx) => (
                      <SessionCard key={idx} session={session} isAdminOrMarshal={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        case 1:
          return <p>Daily Reports section</p>;
        case 2:
          return <p>Notifications center</p>;
        default:
          return null;
      }
    } else if (user?.role === "Walker") {
      switch (activeTab) {
        case 0:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">My Walks</h2>
              {myWalks.length === 0 ? (
                <p>You haven't booked any walks yet.</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myWalks.map((walk, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                      <p className="text-gray-700"><strong>Date:</strong> {new Date(walk.date).toLocaleDateString()}</p>
                      <p className="text-gray-700"><strong>Time:</strong> {walk.time}</p>
                      <p className="text-gray-700"><strong>Dog:</strong> {walk.dog_name}</p>
                      <p className="text-gray-700"><strong>Walker:</strong> {walk.walker_name}</p>
                      <p className="text-gray-700"><strong>Marshal:</strong> {walk.marshal_name}</p>

                      {walk.checked_in ? (
                        <p className="mt-2 text-green-600 font-medium">✅ Checked In</p>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(walk.session_id)}
                          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  ))}



                  </div>
                </div>
              )}
            </div>
          );
        case 1:
          return <p>Saved dogs / Favorites</p>;
        case 2:
          return <p>Your adoption applications</p>;
        default:
          return null;
      }
    } else if (user?.role === "Marshal") {
      switch (activeTab) {
        case 0:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">My Sessions</h2>
              {marshalSessions.length === 0 ? (
                <p>You haven't opened any sessions with walkers yet.</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marshalSessions.map((session, idx) => (
                      <SessionCard key={idx} session={session} isAdminOrMarshal={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        case 1:
          return <p>Your notifications</p>;
        case 2:
          return <p>Your activity</p>;
        default:
          return null;
      }
    } else {
      return <p>User role not recognized.</p>;
    }
  };
  
  
  

  if (loading) return <p className="text-center text-gray-500 mt-5">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500 mt-5">{error}</p>;

  const tabs =
  user?.role === "Admin"
    ? ["Upcoming Walks", "Daily Reports", "Notifications"]
    : user?.role === "Walker"
    ? ["My Walks", "Favorites", "Applications"]
    : user?.role === "Marshal"
    ? ["My Sessions", "Notifications", "Activity"]
    : [];


  return (
    <div className="flex flex-col min-h-screen bg-white">
      {user?.role === "Admin" ? <NavAdmin /> : <NavUser />}
      <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 md:px-8 pb-10">
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>



            {/* Profile Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                {user ? `${user.firstname} ${user.lastname}` : "User"}
              </h1>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  {user?.email}
                </div>

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

                <div className="flex items-center text-gray-600">
                  <Home className="h-5 w-5 mr-2" />
                  Joined {formattedDate}
                </div>
              </div>

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

        {/* Tabs */}
        <div className="flex border rounded-md mb-6">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-1 py-3 px-4 font-medium cursor-pointer ${
                activeTab === index ? "bg-gray-100 text-black" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="border rounded-lg p-6">{renderTabContent()}</div>
     </main>

      <Footer />
    </div>
  );
};

export default Profile;
