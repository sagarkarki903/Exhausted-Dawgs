import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronUp } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Scheduler = () => {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [dogNames, setDogNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchScheduleSlots();
    fetchDogNames();

    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/auth/profile`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchScheduleSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/schedule`, { withCredentials: true });
      setScheduleSlots(response.data);
    } catch (error) {
      console.error("Error fetching schedule slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDogNames = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/dogs`, { withCredentials: true });
      setDogNames(response.data);
    } catch (error) {
      console.error("Error fetching dog names:", error);
    }
  };

  const createScheduleSlot = async (time) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND}/schedule`,
        {
          date: selectedDate,
          time: time,
        },
        { withCredentials: true }
      );
      fetchScheduleSlots();
    } catch (error) {
      console.error("Error creating schedule slot:", error);
    }
  };

  const bookAppointment = async (slotId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND}/schedule/${slotId}/book`,
        {},
        { withCredentials: true }
      );
      fetchScheduleSlots();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Book your dog walking appointments
          </p>
        </motion.div>

        {/* Navigation Arrow */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div 
              className="fixed bottom-8 right-8 z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChevronUp className="h-6 w-6" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Date</h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-xl border-0 shadow-lg dark:bg-gray-700 dark:text-white"
              tileClassName="hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
            />
          </motion.div>

          {/* Schedule Slots Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Available Slots</h2>
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduleSlots
                  .filter((slot) => new Date(slot.date).toDateString() === selectedDate.toDateString())
                  .map((slot) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md border border-gray-200/50 dark:border-gray-600/50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-200">{slot.time}</span>
                        {user?.role === "Walker" && !slot.isBooked && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => bookAppointment(slot.id)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            Book
                          </motion.button>
                        )}
                        {slot.isBooked && (
                          <span className="text-green-500 dark:text-green-400">Booked</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* Create Slot Button for Marshals */}
            {user?.role === "Marshal" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => createScheduleSlot("09:00")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create New Slot
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
