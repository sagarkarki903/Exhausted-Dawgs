import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Edit, Save, X, User, Home, Phone } from "lucide-react";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import { useNavigate } from "react-router-dom";


import axios from "axios";



const Profile = () => {

  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
  const [user, setUser] = useState(null);
  const [favoriteDogs, setFavoriteDogs] = useState([]);
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
  
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  
  
  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewURL(preview);
  }
};


const handleUpload = async () => {
  if (!selectedFile) {
    setUploadMessage("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append('image', selectedFile);

  


  try {
    const res = await axios.post(`${backendUrl}/auth/profile/upload`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    });

    setUploadMessage("Profile picture updated!");
    // update user context/state with new profile picture from backend
    // assuming you have something like setUser
    if (res.data?.profile_pic) {
      setUser(prev => ({ ...prev, profile_pic: res.data.profile_pic }));
      setPreviewURL(null); // clear preview, now we have the real one
      setSelectedFile(null); // reset selection
      window.location.reload(); // reload to see the new image
    }

  } catch (error) {
    console.error("Error uploading profile picture:", error);
    setUploadMessage("Error uploading profile picture.");
  }
};



  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);


  useEffect(() => {
    if (user?.role === "Admin") {
      axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      })
      .then((res) => setUpcomingWalks(res.data))
      .catch((err) => console.error("Error fetching upcoming walks:", err));
    }
  }, [backendUrl, user]);

  useEffect(() => {
    if (user?.role === "Walker") {
      axios.get(`${backendUrl}/reports/walker/my-walks`, {
        withCredentials: true,
      })
      .then((res) => setMyWalks(res.data))
      .catch((err) => console.error("Error fetching walker's walks:", err));
    }
  }, [backendUrl, user]);
  
  useEffect(() => {
    if (user?.role === "Marshal") {
      axios.get(`${backendUrl}/reports/marshal/my-walks`, {
        withCredentials: true,
      })
      .then((res) => setMarshalSessions(res.data))
      .catch((err) => console.error("Error fetching marshal walks:", err));
    }
  }, [backendUrl, user]);
  
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        console.log("User profile:", response.data); // Debug log
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
  }, [backendUrl]);

 useEffect(() => {
    const fetchFavoriteDogs = async () => {
      if (user && user.favorite) {
        try {
          // Parse the favorites which is stored as a text string (JSON string)
          let favArray = [];
          try {
            favArray = JSON.parse(user.favorite);
          } catch (parseError) {
            console.error("Failed to parse favorites:", parseError);
          }
          if (Array.isArray(favArray) && favArray.length > 0) {
            // Fetch details for each favorite dog id
            const favDogs = await Promise.all(
              favArray.map(async (dogId) => {
                const res = await axios.get(`${backendUrl}/dogs/${dogId}`);
                return res.data;
              })
            );
            setFavoriteDogs(favDogs);
          } else {
            setFavoriteDogs([]);
          }
        } catch (err) {
          console.error("Error fetching favorite dogs:", err);
          setFavoriteDogs([]);
        }
      }
    };
    fetchFavoriteDogs();
  }, [backendUrl, user]);


//for assigning dogs
const [dogAssignments, setDogAssignments] = useState({});

  const [allDogs, setAllDogs] = useState([]);
useEffect(() => {
  if (user?.role === "Admin" || user?.role === "Marshal") {
    axios.get(`${backendUrl}/dogs`, { withCredentials: true })
      .then((res) => setAllDogs(res.data))
      .catch((err) => console.error("Error fetching dogs:", err));
  }
}, [backendUrl, user]);


  

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
  

  const handleCheckIn = async (walkerId, sessionId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/reports/check-in`,
        { walkerId, sessionId },
        { withCredentials: true }
      );
  
      if (response.data.message) {
        alert("Walker checked in successfully.");
        // Refresh the session data
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
      }
    } catch (err) {
      console.error("Error checking in walker:", err);
      alert("Failed to check in walker.");
    }
  };


  


// helper function
const SessionCard = ({ session, isAdminOrMarshal }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const initial = {};
    session.walkers.forEach((w) => {
      // Initialize with first dog if any assigned
      initial[w.walker_id] = w.dogs?.[0] || "";
    });
    setAssignments(initial);
  }, [session.walkers]);
  


  // "Dog Details" card view
  if (showDetails) {
      return (
        <div className="bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4">
          <p className="text-gray-800 font-semibold mb-2">Dog Assignments</p>
          {session.walkers.length === 0 ? (
            <p className="text-gray-500 italic">No walkers booked yet.</p>
          ) : (
            <ul className="space-y-4">
            {session.walkers.map((w, idx) => (
              <li key={idx} className="text-gray-700 space-y-2">
             <div className="mb-2">
            <strong className="block text-base text-gray-800">{w.walker_name}</strong>
            {w.dog_names && (
              <div className="mt-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">
                <span className="font-semibold text-gray-600">Currently Assigned:</span> {w.dog_names}
              </div>
            )}
          </div>


                <div className="mt-1">
                <div className="mt-1">
                <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Dogs:
                      </label>
                      <div className="relative">
                      <select
  value={assignments[w.walker_id] || ""}
  onChange={(e) =>
    setAssignments((prev) => ({
      ...prev,
      [w.walker_id]: e.target.value,
    }))
  }
  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 bg-white"
>
  <option value="">Select a dog</option>
  {allDogs.map((dog) => (
    <option key={dog.id} value={dog.id}>
      {dog.name}
    </option>
  ))}
</select>

                      </div>
                    </div>


                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${backendUrl}/reports/assign-dogs`,
                        {
                          schedule_id: session.session_id,
                          walker_id: w.walker_id,
                          dog_ids: assignments[w.walker_id] ? [assignments[w.walker_id]] : [],
                        },
                        { withCredentials: true }
                      );
                      alert("Dogs assigned successfully!");
                    } catch (err) {
                      console.error("Error assigning dogs:", err);
                      alert("Failed to assign dogs.");
                    }
                  }}
                  disabled={(assignments[w.walker_id] || []).length === 0}
                  className={`mt-2 text-xs px-3 py-1 rounded ${
                    (assignments[w.walker_id] || []).length > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Save Assignment
                </button>
              </div>

                          </div>
                        </li>
                      ))}
                    </ul>
                    

                    )}
                    <button
                      className="mt-4 text-sm text-blue-600 underline"
                      onClick={() => setShowDetails(false)}
                    >
                      Back to Session
                    </button>
                  </div>
                );
              }

  // Default card view
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <p className="text-gray-700">
        <strong>Date:</strong>{" "}
        {new Date(session.date).toLocaleDateString()}
      </p>
      <p className="text-gray-700">
        <strong>Time:</strong> {session.time}
      </p>
      <p className="text-gray-700">
        <strong>Marshal:</strong> {session.marshal_name}
      </p>

      <div className="mt-2">
        <p className="font-semibold text-gray-800 mb-2">Walkers</p>
        {session.walkers.length === 0 ? (
          <p className="text-gray-500 italic">No walkers booked yet.</p>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-gray-600 font-semibold border-b">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Walker</th>
                <th className="py-1">Check-In Status</th>
              </tr>
            </thead>
            <tbody>
              {session.walkers.map((w, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="py-1 pr-2">{i + 1}</td>
                  <td className="py-1 pr-2">{w.walker_name}</td>
                  <td className="py-1">
                    {w.checked_in ? (
                      <span className="text-green-600">✅ Checked In</span>
                    ) : (
                      isAdminOrMarshal && (
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                          onClick={() =>
                            handleCheckIn(w.walker_id, session.session_id)
                          }
                        >
                          Check In
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
        <button
          className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-1 px-3 rounded text-sm"
          onClick={() => setShowDetails(true)}
        >
        Dog Details
        </button>
      </div>
    </div>
  );
};

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  isAdminOrMarshal: PropTypes.bool.isRequired,
};

  

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
                <p>You have not booked any walks yet.</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myWalks
                  .map((walk, idx) => (

                    <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                      <p className="text-gray-700"><strong>Date:</strong> {new Date(walk.date).toLocaleDateString()}</p>
                      <p className="text-gray-700"><strong>Time:</strong> {walk.time}</p>
                      <p className="text-gray-700"><strong>Walker:</strong> {walk.walker_name}</p>
                      <p className="text-gray-700"><strong>Marshal:</strong> {walk.marshal_name}</p>

                      <p className={`mt-2 font-medium ${walk.checked_in ? "text-green-600" : "text-red-500"}`}>
                        {walk.checked_in ? "✅ Checked In" : "Not Checked In"}
                      </p>

                    </div>
                  ))}



                  </div>
                </div>
              )}
            </div>
          );
        case 1:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Saved Dogs / Favorites</h2>
              {favoriteDogs.length === 0 ? (
                <p>You have not favorited any dogs yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteDogs.map((dog, index) => {
                    const profilePic = dog.profile_picture_url || "/dog2.jpeg";
                    return (
                      <div key={index} className="rounded-lg border border-gray-300 shadow-md">
                        <img
                          src={profilePic}
                          alt={dog.name}
                          className="h-60 w-full object-cover rounded-t-lg"
                          onError={(e) => (e.target.src = "/dog2.jpeg")}
                        />
                        <div className="p-3">
                          <h2 className="text-lg font-semibold">{dog.name}</h2>
                          <p className="text-gray-600">{dog.breed}</p>
                          <p className="text-gray-500 text-sm">Age: {dog.age} years</p>
                          <button
                            onClick={() => navigate(`/dogs/${dog.id}`)}
                            className="mt-2 w-full bg-red-900 text-white py-1 rounded hover:bg-red-800 transition"
                          >
                            Meet Me
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
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
                <p>You have not opened any sessions with walkers yet.</p>
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
      {loading ? null : user?.role === "Admin" ? <NavAdmin /> : user?.role ? <NavUser /> : null}
      <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 md:px-8 pb-10">
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            

            <div className="flex flex-col items-center justify-center">
                  {/* Profile Picture with Select Button on Hover */}
                  <div className="relative w-36 h-36 group">
                    <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shadow-sm">
                      {user?.profile_pic ? (
                        <img
                          src={previewURL || user?.profile_pic}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}

                      {/* Hover overlay for selecting image */}
                      <div className="absolute inset-0 bg-gray-700 bg-opacity-50 flex items-center rounded-full justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="text-white text-xs cursor-pointer">
                          Change Image
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Upload Button appears ONLY after image is selected */}
                  {previewURL && (
                    <button
                      onClick={handleUpload}
                      className="mt-3 text-xs text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition hover:cursor-pointer"
                    >
                      Upload
                    </button>
                  )}

                  {/* Upload message, disappears automatically */}
                  {uploadMessage && (
                    <p className="text-xs text-green-600 mt-2 text-center">{uploadMessage}</p>
                  )}
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
