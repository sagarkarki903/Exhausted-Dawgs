import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export const RoughCalendar = () => {
  const [events, setEvents] = useState([
    {
      title: "Team Meeting",
      start: new Date(2025, 2, 15, 10, 0), // March 15, 2025, 10:00 AM
      end: new Date(2025, 2, 15, 11, 30), // March 15, 2025, 11:30 AM
    },
    {
      title: "Lunch Break",
      start: new Date(2025, 2, 15, 12, 0), // March 15, 2025, 12:00 PM
      end: new Date(2025, 2, 15, 13, 0), // March 15, 2025, 1:00 PM
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setShowModal(true);
  };

  const handleAddEvent = () => {
    if (!title || !startTime || !endTime || !selectedDate) {
      alert("Please fill in all fields!");
      return;
    }

    const startDateTime = moment(selectedDate).set({
      hour: moment(startTime, "HH:mm").hour(),
      minute: moment(startTime, "HH:mm").minute(),
    }).toDate();

    const endDateTime = moment(selectedDate).set({
      hour: moment(endTime, "HH:mm").hour(),
      minute: moment(endTime, "HH:mm").minute(),
    }).toDate();

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }

    const newEvent = {
      title,
      start: startDateTime,
      end: endDateTime,
    };

    setEvents([...events, newEvent]);
    setShowModal(false);
    setTitle("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Rough Calendar</h2>
      <div className="h-[500px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView="month"
          views={["month", "week", "day"]}
          style={{ height: "500px" }}
          className="bg-gray-100 rounded-lg p-2"
        />
      </div>

      {/* Modal for Adding Event */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Event
            </h2>
            <p className="text-gray-700 mb-3 text-center">
              Selected Date: <strong>{moment(selectedDate).format("MMM D, YYYY")}</strong>
            </p>
            <label className="block text-gray-700 font-medium mb-1">
              Event Title:
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-1">
                  Start Time:
                </label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-medium mb-1">
                  End Time:
                </label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
