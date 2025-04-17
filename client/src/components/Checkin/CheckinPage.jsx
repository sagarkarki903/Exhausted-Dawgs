import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";
import DogAssignModal from "./DogAssignModal";
import { CheckCircle, XCircle } from "lucide-react"; 



const CheckinPage = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWalkerId, setSelectedWalkerId] = useState(null);
const [selectedScheduleId, setSelectedScheduleId] = useState(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
          withCredentials: true,
        });
        setSessions(res.data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchUser();
    fetchSessions();
  }, [backendUrl]);

  const handleCheckIn = async (walkerId, sessionId) => {
    try {
      await axios.put(
        `${backendUrl}/reports/check-in`,
        { walkerId, sessionId },
        { withCredentials: true }
      );
      const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Check-in failed:", err);
    }
  };

  const handleUndoCheckIn = async (walkerId, sessionId) => {
    try {
      await axios.put(
        `${backendUrl}/reports/undo-check-in`,
        { walkerId, sessionId },
        { withCredentials: true }
      );
      const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      console.error("Undo check-in failed:", err);
    }
  };

  const handleComplete = async (sessionId) => {
    if (!window.confirm("Complete this walk?")) return;
    try {
      await axios.post(`${backendUrl}/reports/complete-walk/${sessionId}`, {}, { withCredentials: true });
      const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      alert("Failed to complete walk");
    }
  };

  const handleCancel = async (sessionId) => {
    if (!window.confirm("Cancel this session and all bookings?")) return;
    try {
      await axios.delete(`${backendUrl}/reports/delete-session/${sessionId}`, { withCredentials: true });
      const res = await axios.get(`${backendUrl}/reports/admin/upcoming-walks`, {
        withCredentials: true,
      });
      setSessions(res.data);
    } catch (err) {
      alert("Failed to cancel session");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavAdmin />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Check-In Sessions</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Marshal</th>
                <th className="border p-2">Walker</th>
                <th className="border p-2">Dogs</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Walk Actions</th>
                <th className="p-2">Session Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => (
                <React.Fragment key={idx}>
                  {session.walkers.map((walker, wIdx) => (
                    <tr key={`${idx}-${wIdx}`} className="text-sm">
                      <td className="border p-2 whitespace-nowrap">{new Date(session.date).toLocaleDateString()}</td>
                      <td className="border p-2 whitespace-nowrap">{session.time}</td>
                      <td className="border p-2  whitespace-nowrap">{session.marshal_name}</td>
                      <td className="border p-2 font-semibold whitespace-nowrap">{walker.walker_name}</td>
                      <td className="border p-2 whitespace-nowrap">{walker.dog_names || "-"}</td>
                      <td className="border p-2 whitespace-nowrap">
                        {walker.checked_in ? (
                          <span className="text-green-600 font-semibold">Checked In</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Not Checked In</span>
                        )}
                      </td>
                      <td className="border p-2 space-y-1">
                        {walker.checked_in ? (
                          <button
                            onClick={() => handleUndoCheckIn(walker.walker_id, session.session_id)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                          >
                            Undo Check In
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(walker.walker_id, session.session_id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Check In
                          </button>
                        )}
                   <button
                        onClick={() => {
                            if (!walker.checked_in) return;
                            setSelectedWalkerId(walker.walker_id);
                            setSelectedScheduleId(session.session_id);
                            setShowModal(true);
                        }}
                        disabled={!walker.checked_in}
                        className={`px-2 py-1 rounded text-xs ${
                            walker.checked_in
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        >
                        Assign Dogs
                        </button>

                      </td>
                      {wIdx === 0 ? (
  <td rowSpan={session.walkers.length} className="align-middle">
    <div className="flex justify-center items-center gap-6 py-6">
      <button
        onClick={() => handleComplete(session.session_id)}
        className="text-green-600 hover:text-green-800"
        title="Complete Session"
      >
        <CheckCircle size={32} />
      </button>
      <button
        onClick={() => handleCancel(session.session_id)}
        className="text-red-600 hover:text-red-800"
        title="Cancel Session"
      >
        <XCircle size={32} />
      </button>
    </div>
  </td>
) : null}

                    </tr>
                  ))}
                  <tr><td colSpan="8" className="py-2"></td></tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <DogAssignModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  walkerId={selectedWalkerId}
  scheduleId={selectedScheduleId}
/>

      <Footer />
    </div>
  );
};

export default CheckinPage;
