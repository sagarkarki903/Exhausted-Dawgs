import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // Import for click interaction

const predefinedDates = ["2025-03-20", "2025-03-21", "2025-03-22"]; // Available dates
const availableTimeSlots = ["09:00 AM - 10:00 AM", "10:30 AM - 11:30 AM", "01:00 PM - 02:00 PM"];

export default function RoughCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  // Handle date selection
  const handleDateSelect = (info) => {
    const clickedDate = info.startStr; // FullCalendar returns date as a string (YYYY-MM-DD)
    if (predefinedDates.includes(clickedDate)) {
      setSelectedDate(clickedDate);
      setSelectedTime(""); // Reset selected time
    } else {
      alert("This date is not available for booking.");
    }
  };

  // Handle booking
  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      setBookedSlots([...bookedSlots, { date: selectedDate, time: selectedTime }]);
      alert(`Booked ${selectedTime} on ${selectedDate}`);
      setSelectedDate(null); // Close modal after booking
      setSelectedTime("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold mb-4">Dog Walk Booking Calendar</h2>

      {/* Calendar Display */}
      <div className="mt-6 w-full max-w-2xl">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]} // Added interaction plugin
          initialView="dayGridMonth"
          selectable={true} // Allow date selection
          select={handleDateSelect} // Use select instead of dateClick
          events={bookedSlots.map((slot) => ({
            title: "Booked",
            start: slot.date,
            display: "background", // Highlight date instead of showing text
            backgroundColor: "rgba(0, 128, 0, 0.5)", // Light green highlight
          }))}
          dayCellContent={(e) => (
            <div className="flex items-center justify-center w-full h-full">
              {e.dayNumberText} {/* Keep normal date numbers */}
            </div>
          )}
        />
      </div>

      {/* Modal for Selecting Time Slot */}
      {selectedDate && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Select Time Slot</h3>
            <p className="text-gray-600 mb-3">Booking for {selectedDate}</p>

            {/* Time Slot Dropdown */}
            <select
              className="border p-2 w-full rounded mb-3"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Select a Time Slot</option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot} disabled={bookedSlots.some((b) => b.date === selectedDate && b.time === slot)}>
                  {slot} {bookedSlots.some((b) => b.date === selectedDate && b.time === slot) ? "(Booked)" : ""}
                </option>
              ))}
            </select>

            {/* Buttons */}
            <div className="flex justify-between">
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setSelectedDate(null)}>
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                disabled={!selectedTime}
                onClick={handleBooking}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
