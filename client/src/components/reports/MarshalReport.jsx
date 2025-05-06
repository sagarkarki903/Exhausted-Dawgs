import { useState, useEffect } from "react";
import axios from "axios";
import  { toast } from "react-hot-toast";

export const MarshalReport = () => {
    const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        fetchMarshalReports();
        const fetchMarshalReports = async () => {
            try {
                const response = await axios.get(`${backendUrl}/report/marshal-reports`);
                setSchedules(response.data);
            } catch (error) {
                console.error("Error fetching schedules:", error);
                toast.error("Failed to fetch schedules. Please try again later.");
            }
        };

        fetchMarshalReports();
    }, [backendUrl]); // Fetch schedules when the component mounts

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-xl font-semibold mb-4">Marshal Report - Schedules</h2>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-[#8B2232] text-white">
                        <tr>
                            <th className="p-3 text-left border border-gray-300">Schedule ID</th>
                            <th className="p-3 text-left border border-gray-300">Date</th>
                            <th className="p-3 text-left border border-gray-300">Start Time</th>
                            <th className="p-3 text-left border border-gray-300">End Time</th>
                            <th className="p-3 text-left border border-gray-300">Marshal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule) => (
                            <tr key={schedule.id} className="border-b hover:bg-gray-100">
                                <td className="p-3 border border-gray-300">{schedule.id}</td>
                                <td className="p-3 border border-gray-300">
                                    {new Date(schedule.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </td>
                                <td className="p-3 border border-gray-300">
                                    {new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </td>
                                <td className="p-3 border border-gray-300">
                                    {new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </td>
                                <td className="p-3 border border-gray-300">{schedule.marshal_firstname} {schedule.marshal_lastname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
