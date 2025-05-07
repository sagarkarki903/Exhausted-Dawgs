import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";
import { toast } from "react-hot-toast";


 // Import toast for notifications

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 15; hour++) {
    slots.push(`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`);
    // slots.push(`${hour % 12 || 12}:30 ${hour < 12 ? "AM" : "PM"}`);
  }
  // return slots.slice(0, -1);
  return slots;
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
  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
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



  useEffect(() => {
    const fetchClosedDates = async () => {
      try {
        const res = await axios.get(`${backendUrl}/calendar/closures`);
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
        const res = await axios.get(`${backendUrl}/calendar/sessions`);
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
  
      const res = await axios.get(`${backendUrl}/calendar/sessions/${dateStr}`, 
        {  withCredentials: true,
      });
      console.log(res.data);
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

  const [waiverStatus, setWaiverStatus] = useState("");  // ← Add this at the top with your other state

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
          setResUserId(res.data.id);
          setWaiverStatus(res.data.waiver);  // ✅ This is where you add it
          console.log("Waiver status:", res.data.waiver);
        }
      } catch (err) {
        setLoggedIn(false);
        setRole("");
        setResUserId(null);
        // setWaiverStatus("");  // Reset on failure
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
  //****************************************waiver form************************************************* */
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiverAction, setWaiverAction] = useState(null); // 'openSlot' or session ID
  const WaiverModal = () => {
    const [consent, setConsent] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [is13OrOlder, setIs13OrOlder] = useState(false);
  
    const allChecked = consent && agreeTerms && is13OrOlder;
  
    const handleAgree = async () => {
      try {
        await axios.put(`${backendUrl}/auth/waiver`, {}, { withCredentials: true });
        setWaiverStatus("Yes");
        setShowWaiverModal(false);
        toast.success("Waiver signed!");
        if (waiverAction === "openSlot") {
          setShowOpenSlotForm(true);
        } else if (typeof waiverAction === "number") {
          setBookingScheduleId(waiverAction);
        }
        setWaiverAction(null);
      } catch (error) {
        console.error("Failed to update waiver status", error);
        toast.error("Something went wrong");
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full max-h-[90vh] overflow-y-auto text-sm text-gray-800">
          <h2 className="text-lg font-bold text-red-700 mb-4">Volunteer Liability Waiver</h2>
          <p className="mb-4">
            Please carefully read the terms of the HSAC volunteer liability waiver below. If you would prefer a paper waiver one will be provided in lieu of the digital waiver.
          </p>
          <div className="space-y-2 mb-4">
            <p>
              <strong>Consent for electronic signature:</strong> By checking the box below you are agreeing to the use of an electronic signature. If you would like to opt out, a paper copy is available upon request.
            </p>
            <p>
              <strong>1. Waiver and Release:</strong> I release and forever discharge and hold harmless Humane Society Adoption Center of Monroe Inc. (HSAC) from any and all liability...
            </p>
            <p>
              <strong>2. Insurance:</strong> I understand that HSAC does NOT assume any responsibility to provide me with financial or other assistance...
            </p>
            <p>
              <strong>3. Medical Treatment:</strong> I hereby release HSAC from any claim whatsoever which may arise during my tenure...
            </p>
            <p>
              <strong>4. Assumption and Risk:</strong> I understand that my volunteer services may include hazardous activities and I expressly assume the risks involved...
            </p>
            <p>
              <strong>5. Photographic Release:</strong> I grant HSAC all rights to any images or recordings of me made in connection with my volunteer service.
            </p>
            <p>
              <strong>6. Animal Care:</strong> I acknowledge that I will not train or raise my voice at animals, and I understand the risks involved in working with previously abused animals.
            </p>
          </div>
  
          <div className="mb-4 space-y-3">
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I agree to the use of an electronic signature</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span>I have read and agree to the terms of the liability waiver</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={is13OrOlder} onChange={(e) => setIs13OrOlder(e.target.checked)} />
              <span>I am 13 years of age or older</span>
            </label>
          </div>
  
          <div className="flex justify-end gap-4">
          <button
  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
  onClick={() => {
    setShowWaiverModal(false);
    
    // Rollback any partial state based on intent
    if (waiverAction === "openSlot") {
      setShowOpenSlotForm(false);
    } else if (typeof waiverAction === "number") {
      setBookingScheduleId(null);
    }

    setWaiverAction(null);
  }}
>
  Disagree
</button>

            <button
              className={`px-4 py-2 rounded text-white ${allChecked ? "bg-green-600 hover:bg-green-700" : "bg-green-400 cursor-not-allowed"}`}
              disabled={!allChecked}
              onClick={handleAgree}
            >
              Agree
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  
  const handleAgree = async () => {
    try {
      await axios.put(`${backendUrl}/auth/waiver`, {}, { withCredentials: true });
      setWaiverStatus("Yes");
      setShowWaiverModal(false);
      toast.success("Waiver signed!");
    } catch (error) {
      console.error("Failed to update waiver status", error);
      toast.error("Something went wrong");
    }
  };
  

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
        {/* Calendar Legend */}
  <div className="mb-6 text-sm text-gray-700 flex flex-wrap gap-6 justify-start">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-[#991B1B] rounded-sm border border-gray-300" />
      <span>Available Session</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-[#9CA3AF] rounded-sm border border-gray-300" />
      <span>Closed / Weekend</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-yellow-300 rounded-sm border border-gray-300" />
      <span>Today</span>
    </div>
  </div>
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
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {

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
                  await axios.delete(`${backendUrl}/calendar/closures/${selectedDate}`, {
                    withCredentials: true,
                  });
                  alert("Date reopened!");
                  const res = await axios.get(`${backendUrl}/calendar/closures`);
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
  onClick={() => {
    if (waiverStatus === "Yes") {
      setShowOpenSlotForm((prev) => !prev); // Toggle only if waiver is signed
    } else {
      setWaiverAction("openSlot");
      setShowWaiverModal(true);
    }
  }}
>
  {waiverStatus !== "Yes" || !showOpenSlotForm ? "Open a Slot" : "Cancel"}
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
                              `${backendUrl}/calendar/add-session`,
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
                            const res = await axios.get(`${backendUrl}/calendar/sessions`);
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
                `${backendUrl}/calendar/closures`,
                { date: selectedDate },
                { withCredentials: true }
              );
              
              alert("Date marked as closed!");
              setShowCloseForm(false);

              // Refresh closures
              const res = await axios.get(`${backendUrl}/calendar/closures`);
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
    {/* <p><strong>Date:</strong> {new Date(`${session.date}T00:00:00Z`).toLocaleDateString("en-US")}</p> */}

      <p><strong>Time:</strong> {session.time}</p>
      <p><strong>Marshal:</strong> {session.marshal_name}</p>
      <p><strong>Walkers Booked:</strong> {session.walkers_booked} out of 4</p>

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
                    `${backendUrl}/calendar/book-slot`,
                    {
                      schedule_id: session.id,
                    },
                    { withCredentials: true }
                  );
                  alert("Slot booked successfully!");
                  setBookingScheduleId(null);
                  handleDateClick({ dateStr: selectedDate });

                  const res = await axios.get(`${backendUrl}/calendar/sessions`);
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
                onClick={() => {
                  if (waiverStatus === "Yes") {
                    setBookingScheduleId(session.id);
                  } else {
                    setWaiverAction(session.id);
                    setShowWaiverModal(true);
                  }
                }}
                
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
  {showWaiverModal && <WaiverModal />}

  <Footer />
  </div>
  );
}
