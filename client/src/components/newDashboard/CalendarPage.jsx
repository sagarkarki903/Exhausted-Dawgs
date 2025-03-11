import { Calendar, momentLocalizer } from 'react-big-calendar';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { NewScheduler } from '../scheduling/NewScheduler';
import axios from 'axios';
import { fetchUser } from '../../utils/userService';

const localizer = momentLocalizer(moment);

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [user, setUser] = useState(null);

  //fetch user
//   const fetchUser = async () => {
//     try {
//         const token = localStorage.getItem("token");

//         console.log("🔹 Fetch User: Token Sent to Backend:", token); // ✅ Debugging Log

//         if (!token) {
//             console.error("🚨 No token found in localStorage!");
//             return;
//         }

//         const response = await axios.get("https://exhausted-dawgs.onrender.com/newschedule/me", {
//             headers: {
//                 Authorization: `Bearer ${token}`, // ✅ Ensure token is included
//             },
//             withCredentials: true, // ✅ Allow cookies
//         });

//         console.log("✅ User Data Fetched:", response.data);
//         setUser(response.data);
//     } catch (error) {
//         console.error("🚨 Error fetching user:", error);
//     }
// };



useEffect(() => {
  const getUser = async () => {
      const userData = await fetchUser();
      if (userData) {
          setUser(userData);
      }
  };
  getUser();
}, []);
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setShowModal(true);
  };


  const handleBookAppointment = async () => {
    if (!startTime || !endTime || !selectedDate || !user) {
        alert("Please select a valid date and time range.");
        return;
    }

    // ✅ Convert time inputs to moment.js objects for comparison
    const startMoment = moment(startTime, "HH:mm");
    const endMoment = moment(endTime, "HH:mm");

    if (endMoment.isSameOrBefore(startMoment)) {
        alert("End time must be after the start time.");
        return;
    }

    const formattedDate = moment(selectedDate).format("YYYY-MM-DD"); // Matches MySQL `DATE` format
    const formattedStartTime = startMoment.format("HH:mm:ss"); // Matches MySQL `TIME` format
    const formattedEndTime = endMoment.format("HH:mm:ss");

    try {
        const response = await axios.post("https://exhausted-dawgs.onrender.com/newschedule/schedule", {
            date: formattedDate,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
        }, { withCredentials: true });

        alert(response.data.message); // Show success message
        setShowModal(false); // Close modal
        setStartTime('');
        setEndTime('');
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Failed to save appointment.");
    }
};


  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Left Side - Compact Calendar */}
      <div className="w-full md:w-3/4 lg:w-1/2 max-w-3xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView="month"
          views={['month', 'week', 'day']}
          step={30}
          timeslots={2}
          style={{ height: '500px' }}
          className="rounded-lg"
          eventPropGetter={() => ({
            style: {
                backgroundColor: '#8B2232', //golden
                color: '#FDC700', 
                borderRadius: '5px',
                border: 'none',
                fontWeight: 'bold',
              },
          })}
        />
      </div>

      {/* Right Side - Upcoming Appointments */}
      <div className="w-full md:w-3/4 lg:w-1/3 max-w-md bg-white p-5 rounded-lg shadow-lg">

        <NewScheduler user={user} />
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white/5 to-white/20 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px] relative">
            <h2 className="text-xl font-semibold mb-4 text-center">Book an Appointment</h2>
            <p className="text-gray-700 mb-3 text-center">
              Selected Date: <strong>{moment(selectedDate).format('MMM D, YYYY')}</strong>
            </p>

            {/* Appointment user's Name */}
            <p className="text-gray-700 font-medium mb-1"><strong>Name:</strong> {user.firstname} {user.lastname}</p>
            {/* Time Selection */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-1">Start Time:</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-1">End Time:</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
