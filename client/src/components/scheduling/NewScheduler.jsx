import React, { useState, useEffect } from "react";
import axios from "axios";

export const NewScheduler = () => {
    const [schedules, setSchedules] = useState([]);
    const [expandedSlot, setExpandedSlot] = useState(null);
    const [user, setUser] = useState(null);
    const [dogName, setDogName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchSchedules();
        fetchUser();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await axios.get("http://localhost:8080/newschedule/all-schedules");
            setSchedules(response.data);
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/newschedule/me", {
                withCredentials: true,
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const toggleSlot = (index) => {
        setExpandedSlot(expandedSlot === index ? null : index);
        setDogName("");
        setStartTime("");
        setEndTime("");
        setErrorMessage(""); 
    };

    // ✅ Function to format time in AM/PM
    const formatTimeToAMPM = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleBookWalker = async (schedule) => {
        if (!dogName || !startTime || !endTime) {
            setErrorMessage("🚨 Please enter a dog name and a valid time range.");
            return;
        }

        const formattedStartTime = startTime + ":00";
        const formattedEndTime = endTime + ":00";

        try {
            const response = await axios.post(
                "http://localhost:8080/newschedule/book-walker",
                {
                    schedule_id: schedule.id,  
                    dog_name: dogName,         
                    start_time: formattedStartTime, 
                    end_time: formattedEndTime
                },
                { withCredentials: true }
            );

            setErrorMessage("");
            setExpandedSlot(null);
            fetchSchedules(); // ✅ Refresh schedules after booking
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage(`❌ ${error.response.data.message}`);
            } else {
                setErrorMessage("❌ Failed to book appointment.");
            }
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>
            {schedules.length > 0 ? (
                <div className="space-y-4">
                    {schedules.map((schedule, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                            <div className="cursor-pointer" onClick={() => toggleSlot(index)}>
                                <p className="text-lg font-semibold text-gray-800">
                                    {new Date(schedule.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Time:</strong> {formatTimeToAMPM(schedule.start_time)} - {formatTimeToAMPM(schedule.end_time)}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Marshal:</strong> {schedule.firstname} {schedule.lastname}
                                </p>

                                {/* ✅ Added Number of Walkers */}
                                <p className="text-gray-700">
                                    <strong>Walkers: 👣</strong> {schedule.walker_count} / 4
                                </p>
                            </div>

                            {expandedSlot === index && user && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Book a Slot</h3>

                                    <p className="text-gray-700 font-medium mb-2">
                                        <strong>Name:</strong> {user.firstname} {user.lastname}
                                    </p>

                                    <label className="block text-gray-700 font-medium mb-1">Dog Name:</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md mb-3 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Enter your dog's name"
                                        value={dogName}
                                        onChange={(e) => setDogName(e.target.value)}
                                    />

                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                                        <div className="w-full">
                                            <label className="block text-gray-700 font-medium mb-1">Start Time:</label>
                                            <input
                                                type="time"
                                                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                                                min={schedule.start_time}
                                                max={schedule.end_time}
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label className="block text-gray-700 font-medium mb-1">End Time:</label>
                                            <input
                                                type="time"
                                                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:outline-none"
                                                min={startTime}
                                                max={schedule.end_time}
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message (if any) */}
                                    {errorMessage && (
                                        <p className="text-[#8B2232] font-semibold mt-2">{errorMessage}</p>
                                    )}

                                    <div className="flex justify-between mt-6">
                                        <button
                                            onClick={() => setExpandedSlot(null)}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleBookWalker(schedule)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">No upcoming appointments.</p>
            )}
        </div>
    );
};
