import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 15; hour++) {
    slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`);
    slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? "AM" : "PM"}`);
  }
  return slots.slice(0, -1);
};

const generateWeekendsInRange = (startDateStr, endDateStr) => {
  const weekends = [];
  const date = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  while (date <= endDate) {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      weekends.push(date.toISOString().split("T")[0]);
    }
    date.setDate(date.getDate() + 1);
  }

  return weekends;
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

  const [weekendDates, setWeekendDates] = useState([]);

//for booking the slot
  const [bookingScheduleId, setBookingScheduleId] = useState(null);
  const [walkerDogId, setWalkerDogId] = useState("");



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
      const res = await axios.get(`http://localhost:8080/calendar/sessions/${dateStr}`, 
        {  withCredentials: true,
      });
      const sortedSessions = res.data.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}`);
        const timeB = new Date(`1970-01-01T${b.time}`);
        return timeA - timeB;
      });
      setSessionDetails(sortedSessions);
      
    } catch (err) {
      console.error("Error fetching session details:", err);
      setSessionDetails([]);
    }
  };

  const [resUserId, setResUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/auth/profile", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
          setResUserId(res.data.id); // 👈 Save current user's ID
        }
      } catch (err) {
        setLoggedIn(false);
        setRole("");
        setResUserId(null);
      }
    };
    checkAuth();
  }, []);


  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getUTCDay(); // ✅ Use getUTCDay() to avoid timezone confusion
    return day === 0 || day === 6;
  };
  
//to prevent flickering
  // if (!role) {
  //   return <div className="p-6">Loading...</div>;
  // }
  

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-900">
        {/* NAVBAR */}
        {!loggedIn ? (
          <Navbar />
        ) : role === "Admin" ? (
          <NavAdmin />
        ) : (
          <NavUser />
        )}

         {/* MAIN CALENDAR CONTENT */}
        <main className="flex-1">

    <div className="flex flex-col md:flex-row gap-10 p-4">
    <div className="w-full md:w-[60%] max-w-4xl mx-auto">

        <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
              height="auto"
            dateClick={handleDateClick}
            datesSet={(arg) => {
              const weekends = generateWeekendsInRange(arg.startStr, arg.endStr);
              setWeekendDates(weekends);
            }}
            
            events={[
              ...availableDates.map((date) => ({
                start: date,
                display: "background",
                backgroundColor: "#991B1B",
              })),
              ...closedDates.map((date) => ({
                start: date,
                display: "background",
                backgroundColor: "#9CA3AF",
              })),
              ...weekendDates.map((date) => ({
                start: date,
                display: "background",
                backgroundColor: "#9CA3AF", // dark gray
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
          <div className="text-red-600 font-semibold mb-4">
          Shelter is closed on this date.
          {loggedIn && role === "Admin" && (
            <button
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:8080/calendar/closures/${selectedDate}`, {
                    withCredentials: true,
                  });
                  alert("Date reopened!");
                  const res = await axios.get("http://localhost:8080/calendar/closures");
                  const formatted = res.data.map((d) => new Date(d).toISOString().split("T")[0]);
                  setClosedDates(formatted);
                } catch (err) {
                  alert(err.response?.data?.message || "Failed to reopen date.");
                }
              }}
              className="block mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Mark as Open
            </button>
          )}
        </div>
        
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
            
                              },
                              { withCredentials: true }
                            );
                            alert("Slot opened!");
                            setShowOpenSlotForm(false);
                            setSelectedTime("");

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
                          }catch (err) {
                            const msg = err.response?.data?.message;

                            if (msg === "You already have a session at this time.") {
                              alert("You already have a session booked at this time. Please choose a different time slot.");
                            } else {
                              alert(msg || "Something went wrong while creating the slot.");
                            }
                            
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
{!loggedIn ? (
  <p className="text-blue-600 font-semibold mt-3">
    Log in to view session details
  </p>
) : sessionDetails.length > 0 ? (
  sessionDetails.map((session, idx) => (
    <div key={idx} className="mb-4 border p-4 rounded bg-white shadow-sm">
      <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString("en-US")}</p>
      <p><strong>Time:</strong> {session.time}</p>
      <p><strong>Marshal:</strong> {session.marshal_name}</p>
      <p><strong>Walkers Booked:</strong> {session.walkers_booked}</p>

      {role === "Walker" && (
        <>
          {session.user_booked ? (
            <p className="mt-3 text-green-600 font-semibold">You Booked this Slot</p>
          ) : session.walkers_booked >= 4 ? (
            <p className="mt-3 text-sm font-semibold text-red-600">Slots full</p>
          ) : bookingScheduleId === session.id ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.post(
                    "http://localhost:8080/calendar/book-slot",
                    {
                      schedule_id: session.id,
                      dog_id: walkerDogId,
                    },
                    { withCredentials: true }
                  );
                  alert("Slot booked successfully!");
                  setWalkerDogId("");
                  setBookingScheduleId(null);
                  handleDateClick({ dateStr: selectedDate });

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
                  const msg = err.response?.data?.message;
                  if (msg === "You have already booked this session") {
                    alert("You already booked this session.");
                  } else if (msg === "This session is already full") {
                    alert("Session is full.");
                  } else if (msg === "This dog is already booked for this time") {
                    alert("This dog is already booked at that time.");
                  } else {
                    alert(msg || "Failed to book slot.");
                  }
                }
              }}
              className="mt-3 space-y-2"
            >
              <input
                type="number"
                placeholder="Enter Dog ID"
                value={walkerDogId}
                onChange={(e) => setWalkerDogId(e.target.value)}
                className="w-full border px-2 py-1 rounded"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 text-sm"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                  onClick={() => {
                    setBookingScheduleId(null);
                    setWalkerDogId("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            !session.user_booked && (
              <button
                className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                onClick={() => setBookingScheduleId(session.id)}
              >
                Book this Slot
              </button>
            )
          )}
        </>
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
  </main>
  <Footer />
  </div>
  );
}
