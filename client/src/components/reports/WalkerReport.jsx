import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const WalkerReport = () => {
    const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchWalkerReports();
    }, [backendUrl, fetchWalkerReports]); // Fetch appointments when the component mounts

    const fetchWalkerReports = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/report/walker-reports`);
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Failed to fetch appointments. Please try again later.");
        }
    }, [backendUrl]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-xl font-semibold mb-4">Walker Report - Appointments</h2>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-[#8B2232] text-white">
                        <tr>
                            <th className="p-3 text-left border border-gray-300">Schedule ID</th>
                            <th className="p-3 text-left border border-gray-300">Dog Name</th>
                            <th className="p-3 text-left border border-gray-300">Start Time</th>
                            <th className="p-3 text-left border border-gray-300">End Time</th>
                            <th className="p-3 text-left border border-gray-300">Walker</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id} className="border-b hover:bg-gray-100">
                                <td className="p-3 border border-gray-300">{appointment.schedule_id}</td>
                                <td className="p-3 border border-gray-300">{appointment.dog_name}</td>
                                <td className="p-3 border border-gray-300">
                                    {new Date(`2000-01-01T${appointment.start_time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </td>
                                <td className="p-3 border border-gray-300">
                                    {new Date(`2000-01-01T${appointment.end_time}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </td>
                                <td className="p-3 border border-gray-300">{appointment.walker_firstname} {appointment.walker_lastname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
