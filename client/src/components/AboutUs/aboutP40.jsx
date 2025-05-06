import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PawPrint, Sun, Moon } from "lucide-react";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { NavAdmin } from "../NavAndFoot/NavAdmin";
import { Footer } from "../NavAndFoot/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaDog,
  FaWalking,
  FaUserPlus,
  FaUsers,
  FaDonate,
  FaHistory,
} from "react-icons/fa";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const AboutP40 = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [scrollWidth, setScrollWidth] = useState("0%");
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? savedMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleDarkModeToggle = () => {
    setIsDark(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND;
    axios.get(`${backendUrl}/auth/profile`, { withCredentials: true })
      .then(res => {
        setLoggedIn(res.status === 200);
        setRole(res.data.role || "");
      })
      .catch(() => {
        setLoggedIn(false);
        setRole("");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : "0%";
      setScrollWidth(scrolled);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const icons = useMemo(() => ({
    Introduction: <FaDog className="inline-block mr-2 mb-1" />,
    "Scheduling a Walk": <FaWalking className="inline-block mr-2 mb-1" />,
    "Create an Account": <FaUserPlus className="inline-block mr-2 mb-1" />,
    "Become a Marshal": <FaUsers className="inline-block mr-2 mb-1" />,
    "Adoption Process & Donations": <FaDonate className="inline-block mr-2 mb-1" />,
    "History and Founder": <FaHistory className="inline-block mr-2 mb-1" />,
  }), []);

  const sections = [
    {
      title: "Introduction",
      content: "Welcome to Project P-40! We strive to connect people with shelter dogs through our innovative adoption and walking programs.",
    },
    {
      title: "Scheduling a Walk",
      content: "Our scheduling tool allows users to set up dog walks easily. Choose a time and location, and enjoy quality time with a furry friend!",
    },
    {
      title: "Create an Account",
      content: "Join our community by creating an account. This will allow you to schedule walks, track your history, and apply for adoption.",
    },
    {
      title: "Become a Marshal",
      content: "Interested in taking a leadership role? Apply to become a Marshal and help manage dog walks and ensure safety.",
    },
    {
      title: "Adoption Process & Donations",
      content: "Learn how our adoption process works and how your donations help support our mission of finding homes for dogs in need.",
    },
    {
      title: "History and Founder",
      content: "Project P-40 was founded by passionate animal lovers dedicated to making a difference in the lives of shelter dogs and their future owners.",
    },
  ];

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-700 relative">

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-cyan-600 z-50 transition-all duration-75 ease-out" style={{ width: scrollWidth }} />

      {loading ? (
        <div className="flex flex-col flex-1 justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600 border-opacity-50"></div>
          <p className="mt-4 text-cyan-700 dark:text-cyan-300">Loading...</p>
        </div>
      ) : (
        <>
          {!loggedIn ? (
            <Navbar 
              onDarkModeToggle={handleDarkModeToggle}
              isDarkMode={isDark}
            />
          ) : role === "Admin" ? (
            <NavAdmin 
              onDarkModeToggle={handleDarkModeToggle}
              isDarkMode={isDark}
            />
          ) : (
            <NavUser 
              onDarkModeToggle={handleDarkModeToggle}
              isDarkMode={isDark}
            />
          )}

          <main className="flex-1">
            <section className="py-20 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-cyan-600 text-white">
              <motion.div className="absolute inset-0 z-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute z-2 text-white/20"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      fontSize: `${Math.random() * 20 + 10}px`,
                    }}
                    animate={{ y: [0, 10, 0], rotate: [0, 360] }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                  >
                    <PawPrint aria-label="Decorative paw print" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="relative z-10 px-4 md:px-6 text-center"
                initial="hidden"
                animate="visible"
                variants={staggerChildren}
              >
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg"
                  variants={fadeInUp}
                >
                  About Project P-40
                </motion.h1>
                <motion.p
                  className="max-w-3xl mx-auto mt-4 text-lg font-medium text-white/90"
                  variants={fadeInUp}
                >
                  Learn about our mission, history, and how you can get involved.
                </motion.p>
              </motion.div>
            </section>

            {sections.map((section, index) => (
              <motion.section
                key={index}
                className={`py-16 px-4 md:px-6 my-8 rounded-xl shadow-xl ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gradient-to-br from-cyan-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="max-w-5xl mx-auto">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    custom={index}
                  >
                    <h2 className="text-3xl font-bold text-center border-b-4 border-cyan-500 dark:border-cyan-400 pb-4 mb-6">
                      {icons[section.title]} {section.title}
                    </h2>
                    <p className="mt-2 text-lg leading-relaxed text-center md:text-left">
                      {section.content}
                    </p>
                  </motion.div>
                </div>
              </motion.section>
            ))}

            <motion.section 
              className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="max-w-4xl mx-auto px-4">
                <h3 className="text-4xl font-bold mb-4">Ready to get involved?</h3>
                <p className="mb-6 text-lg">Join the mission — create an account or contact us to become a part of the P-40 family.</p>
                <motion.button
                  onClick={handleCreateAccount}
                  className="inline-block bg-white text-cyan-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Account
                </motion.button>
              </div>
            </motion.section>
          </main>

          {scrollWidth !== '0%' && (
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              style={{ zIndex: 50 }}
              aria-label="Scroll to top"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transform group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                <motion.div
                  className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.button>
          )}

          <Footer />
        </>
      )}
    </div>
  );
};

export default AboutP40;
