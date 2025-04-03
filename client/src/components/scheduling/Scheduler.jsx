import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

const Scheduler = () => {
  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dogName, setDogName] = useState("");

  useEffect(() => {
    fetchUser(); // Fetch user details on mount
    fetchSchedule(); // Fetch available schedule slots
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${backendUrl}/schedule/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User Data:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${backendUrl}/schedule`);
      console.log("📅 Fetched Schedule Data:", response.data);
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  console.log("📅 Selected Date:", date.toISOString().split("T")[0]);
console.log("📅 Schedule Dates in API:", schedule.map(slot => slot.date));

const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split("T")[0]; // Convert to YYYY-MM-DD
};

  const createSchedule = async () => {
    if (!user || user.role !== "Marshal") return alert("Only Marshals can create schedules.");

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const response = await axios.post(`${backendUrl}/schedule`, 
        {
          date: date.toISOString().split("T")[0],
          time_slot: "10:00 AM - 12:00 PM",
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Create Schedule Response:", response.data);

      fetchSchedule();
      alert("Schedule created successfully.");
    } catch (error) {
      console.error("Failed to create schedule:", error.response?.data || error);
      alert("Failed to create schedule.");
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return alert("Please select a slot.");
    if (!dogName) return alert("Please enter a dog name.");
    if (!user || user.role !== "Walker") return alert("Only Walkers can book an appointment.");
    

    try {
      await axios.post(
        `${backendUrl}/schedule/appointments`,
        {
          schedule_id: selectedSlot.id,
          walker_id: user.id,
          dog_name: dogName,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchSchedule();
      alert("Appointment booked successfully.");
    } catch (error) {
      console.error("Failed to book appointment:", error.response?.data || error);
      alert("Failed to book appointment.");
    }
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dog Walking Scheduler</h2>
      <p>Welcome, {user.role}</p>

      <Calendar onChange={setDate} value={date} className="mb-4" />

      {user.role === "Marshal" && (
        <button className="bg-blue-500 text-white p-2 rounded" onClick={createSchedule}>
          Create Schedule Slot
        </button>
      )}

      <h3 className="text-lg mt-4">Available Slots:</h3>
      {schedule.length === 0 ? (
        <p>No available slots for this day.</p>
      ) : (
      <ul>
        {schedule
          .filter((slot) => formatDate(slot.date) === formatDate(date))
          .map((slot) => (
            <li key={slot.id} className="border p-2 mb-2">
              <span>
                {slot.time_slot} - Marshal: {slot.marshal_id}
              </span>
              {user.role === "Walker" && (
                <button
                  className="bg-green-500 text-white p-2 ml-4 rounded"
                  onClick={() => setSelectedSlot(slot)}
                >
                  Book Appointment
                </button>
              )}
            </li>
          ))}
      </ul>
      )}

      {user.role === "Walker" && selectedSlot && (
        <div className="mt-4">
          <h3 className="text-lg">Book Appointment</h3>
          <input
            type="text"
            placeholder="Dog Name"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            className="border p-2 w-full"
          />
          <button className="bg-green-500 text-white p-2 mt-2 rounded" onClick={bookAppointment}>
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
