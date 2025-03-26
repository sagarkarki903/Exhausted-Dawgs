import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";


const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 15; hour++) {
    slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`);
    slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? "AM" : "PM"}`);
  }
  return slots.slice(0, -1);
};

const timeSlots = generateTimeSlots();

const convertTo24Hour = (timeStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = parseInt(hours) + 12;
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours}:${minutes}:00`;
};

export default function RoughCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [sessionDetails, setSessionDetails] = useState([]);

  const [showOpenSlotForm, setShowOpenSlotForm] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [dogId, setDogId] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  const isPastDate = (dateStr) => {
    const selected = new Date(dateStr + "T00:00:00"); // Force midnight local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  };
  

  const [closedDates, setClosedDates] = useState([]);

  const [showCloseForm, setShowCloseForm] = useState(false);


  useEffect(() => {
    const fetchClosedDates = async () => {
      try {
        const res = await axios.get("http://localhost:8080/calendar/closures");
        const formatted = res.data.map((d) => new Date(d).toISOString().split("T")[0]);
        setClosedDates(formatted);
      } catch (err) {
        console.error("Error fetching closed dates:", err);
      }
    };
  
    fetchClosedDates();
  }, []);
  
  const isClosedDate = (dateStr) => closedDates.includes(dateStr);


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get("http://localhost:8080/calendar/sessions");
        const uniqueDates = [
          ...new Set(
            res.data
              .map((s) => {
                const parsedDate = new Date(s);
                return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split("T")[0];
              })
              .filter(Boolean)
          ),
        ];
        setAvailableDates(uniqueDates);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };

    fetchSessions();
  }, []);

  const handleDateClick = async (arg) => {
    const dateStr = arg.dateStr;
    setSelectedDate(dateStr);
    try {
      const res = await axios.get(`http://localhost:8080/calendar/sessions/${dateStr}`);
      setSessionDetails(res.data);
    } catch (err) {
      console.error("Error fetching session details:", err);
      setSessionDetails([]);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/auth/profile", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
        }
      } catch (err) {
        setLoggedIn(false);
        setRole("");
      }
    };
    checkAuth();
  }, []);

  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getUTCDay(); // ✅ Use getUTCDay() to avoid timezone confusion
    return day === 0 || day === 6;
  };
  

  return (
    <div className="flex flex-col md:flex-row gap-10 p-6">
      <div className="w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          events={[
            ...availableDates.map((date) => ({
              start: date,
              display: "background",
              backgroundColor: "#991B1B",
            })),

              //for closed dates
            ...closedDates.map((date) => ({
              start: date,
              display: "background",
              backgroundColor: "#9CA3AF", // gray-400
            })),
          
          ]}
        />
      </div>

      {selectedDate && (
        <div className="w-full md:w-1/3 bg-gray-50 p-5 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Sessions for{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>

          {isWeekend(selectedDate) ? (
          <p className="text-red-600 font-semibold">
            Sorry! Shelter is closed on Saturdays and Sundays.
          </p>
        ) : isClosedDate(selectedDate) ? (
          <p className="text-red-600 font-semibold">
            Sorry! Shelter is closed on this date.
          </p>
        ) : isPastDate(selectedDate) ? (

          <p className="text-yellow-600 font-semibold">
            Cannot open slots for past dates.
          </p>
        ) : (

            <>
              {/* Open Slot Button */}
              {loggedIn && (role === "Admin" || role === "Marshal") && (
                <div className="mb-5">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 w-full"
                    onClick={() => setShowOpenSlotForm(!showOpenSlotForm)}
                  >
                    {showOpenSlotForm ? "Cancel" : "Open a Slot"}
                  </button>

                  {showOpenSlotForm && (
                    <>
                      <hr className="my-4" />
                      <form
                        className="space-y-3"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            await axios.post(
                              "http://localhost:8080/calendar/add-session",
                              {
                                date: selectedDate,
                                time: convertTo24Hour(selectedTime),
                                dog_id: dogId,
                              },
                              { withCredentials: true }
                            );
                            alert("Slot opened!");
                            setShowOpenSlotForm(false);
                            setSelectedTime("");
                            setDogId("");

                            // Refresh UI
                            const res = await axios.get("http://localhost:8080/calendar/sessions");
                            const uniqueDates = [
                              ...new Set(
                                res.data
                                  .map((s) => {
                                    const parsedDate = new Date(s);
                                    return isNaN(parsedDate.getTime())
                                      ? null
                                      : parsedDate.toISOString().split("T")[0];
                                  })
                                  .filter(Boolean)
                              ),
                            ];
                            setAvailableDates(uniqueDates);
                            handleDateClick({ dateStr: selectedDate });
                          } catch (err) {
                            alert(err.response?.data?.message || "Failed to open slot.");
                          }
                        }}
                      >
                        <div>
                          <label className="block text-sm font-medium">Select Time</label>
                          <select
                            className="w-full border p-2 rounded"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                          >
                            <option value="">-- Select Time --</option>
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium">Dog ID</label>
                          <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={dogId}
                            onChange={(e) => setDogId(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800"
                        >
                          Submit
                        </button>
                      </form>
                    </>
                  )}

{loggedIn && role === "Admin" && !isClosedDate(selectedDate) && !isWeekend(selectedDate) && !isPastDate(selectedDate) && (
  <div className="mb-5">
    <button
      className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 w-full"
      onClick={() => setShowCloseForm(!showCloseForm)}
    >
      {showCloseForm ? "Cancel" : "Mark as Closed"}
    </button>

    {showCloseForm && (
      <>
        <hr className="my-4" />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.post(
                "http://localhost:8080/calendar/closures",
                { date: selectedDate },
                { withCredentials: true }
              );
              
              alert("Date marked as closed!");
              setShowCloseForm(false);

              // Refresh closures
              const res = await axios.get("http://localhost:8080/calendar/closures");
              const formatted = res.data.map((d) => new Date(d).toISOString().split("T")[0]);
              setClosedDates(formatted);
            } catch (err) {
              alert(err.response?.data?.message || "Failed to close date");
            }
          }}
        >
        
          <button
            type="submit"
            className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
          >
            Confirm Closure
          </button>
        </form>
      </>
    )}
  </div>
)}

                </div>
              )}

              {/* Sessions */}
              {sessionDetails.length > 0 ? (
                sessionDetails.map((session, idx) => (
                  <div key={idx} className="mb-4 border p-4 rounded bg-white shadow-sm">
                    <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString("en-US")}</p>
                    <p><strong>Time:</strong> {session.time}</p>
                    <p><strong>Marshal:</strong> {session.marshal_name}</p>
                    <p><strong>Dog:</strong> {session.dog_name}</p>
                    <p><strong>Walkers Booked:</strong> {session.walkers_booked}</p>
                    {loggedIn && (
                      session.walkers_booked >= 4 ? (
                        <p className="mt-3 text-sm font-semibold text-red-600">Slots full</p>
                      ) : (
                        <button
                          className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                          onClick={() => console.log("Book slot for schedule ID:", session.id)}
                        >
                          Book this Slot
                        </button>
                      )
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No sessions booked for this date.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
