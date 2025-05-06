/* Updated Home.jsx with polished gallery, adoption process, improved hover effects, hero text animation, and a loading spinner */

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, PawPrint, Moon, Sun } from "lucide-react";
import { Navbar } from "./NavAndFoot/Navbar";
import { NavUser } from "./NavAndFoot/NavUser";
import { NavAdmin } from "./NavAndFoot/NavAdmin";
import { Footer } from "./NavAndFoot/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export const Home = () => {
  const backendUrl = import.meta.env.VITE_BACKEND;
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollWidth, setScrollWidth] = useState("0%");

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role);
        }
      } catch {
        setLoggedIn(false);
        setRole("");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/dogs`);
        console.log("Dogs data received:", response.data);
        const shuffledDogs = response.data.sort(() => 0.5 - Math.random());
        setDogs(shuffledDogs);
      } catch (error) {
        console.error("Error fetching dogs:", error);
        console.log("Backend URL:", backendUrl);
      }
    };
    fetchDogs();
  }, [backendUrl]);

  useEffect(() => {
    const updateDisplayCount = () => {
      setDisplayCount(window.innerWidth < 1024 ? 2 : 4);
    };
    updateDisplayCount();
    window.addEventListener("resize", updateDisplayCount);
    return () => window.removeEventListener("resize", updateDisplayCount);
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-700 scroll-smooth relative">
      {loading ? (
        <div className="flex flex-col flex-1 justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600 border-opacity-50"></div>
          <p className="mt-4 text-cyan-700 dark:text-cyan-300">Loading dogs...</p>
        </div>
      ) : (
        <>
          {!loggedIn ? (
            <Navbar 
              onDarkModeToggle={toggleDarkMode}
              isDarkMode={isDarkMode}
            />
          ) : role === "Admin" ? (
            <NavAdmin 
              onDarkModeToggle={toggleDarkMode}
              isDarkMode={isDarkMode}
            />
          ) : (
            <NavUser 
              onDarkModeToggle={toggleDarkMode}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Scroll Progress Bar */}
          <motion.div
            className="fixed top-0 left-0 h-1 bg-cyan-600 z-50"
            style={{ width: `${(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%` }}
            animate={{ width: `${(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%` }}
            transition={{ duration: 0.2 }}
          />

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

              <div className="relative z-10 px-4 md:px-6 text-center">
                <motion.h1
                  className="text-6xl font-extrabold drop-shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                >
                  Find Your Furry Friend
                </motion.h1>
                <motion.p className="text-xl text-white/90 mt-4" variants={fadeInUp}>
                  Explore our lovable dogs waiting for their forever home.
                </motion.p>
                <motion.a 
                    href="/dogs"
                  className="inline-block mt-6 rounded-xl bg-white text-cyan-700 font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition scroll-smooth"
                  whileHover={{ scale: 1.05 }}
                  >
                    Meet Our Dogs
                </motion.a>
          </div>
        </section>

            <motion.section className="py-16 bg-white dark:bg-gray-800" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <motion.h2 className="text-4xl font-extrabold text-center text-cyan-700 dark:text-cyan-400 mb-8" variants={fadeInUp}>
              Available Dogs 🐾
            </motion.h2>
              <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] px-4 md:px-6">
                {dogs.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">No dogs available right now.</p>
                ) : (
                  dogs.slice(0, displayCount).map((dog, index) => (
                <motion.div
                  key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                      <div className="rounded-xl bg-white dark:bg-gray-700 border border-cyan-200 dark:border-cyan-800 shadow-lg overflow-hidden transition duration-300 hover:shadow-2xl">
                        <img
                          src={dog.profile_picture_url || "/dog2.jpeg"}
                          alt={dog.name}
                          loading="lazy"
                          className="h-64 w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-4 flex flex-col gap-2">
                          <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">{dog.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{dog.age} years • {dog.breed}</p>
                          <button
                            className="rounded-lg bg-cyan-600 text-white py-2 px-4 mt-2 hover:bg-cyan-700 transition"
                            onClick={() => navigate(`/dogs/${dog.id}`)}
                          >
                                          Meet Me                      
                                        </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

            <motion.section 
              className="py-16 bg-gradient-to-br from-cyan-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700" 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }}
            >
              <motion.h2 className="text-4xl font-extrabold text-center text-cyan-800 dark:text-cyan-300 mb-10">
                Adoption Process
              </motion.h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-6">
                {["Submit Application", "Meet Your Match", "Home Check", "Welcome Home"].map((step, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }}>
                    <div className="rounded-xl bg-white dark:bg-gray-700 border border-cyan-300 dark:border-cyan-600 p-6 shadow-md hover:shadow-xl transition">
                      <PawPrint className="mx-auto text-cyan-600 dark:text-cyan-400 h-12 w-12 mb-4" />
                      <h3 className="text-xl font-bold text-center text-cyan-700 dark:text-cyan-300">Step {i + 1}</h3>
                      <p className="text-center text-gray-600 dark:text-gray-300">{step}</p>
                </div>
              </motion.div>
            ))}
              </div>
            </motion.section>

            <motion.section 
              className="py-16 bg-white dark:bg-gray-800"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 className="text-4xl font-extrabold text-center text-cyan-700 dark:text-cyan-400 mb-8">
                Gallery 🐕
            </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6">
                {dogs.slice(0, 8).map((dog, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.05 }}>
                    <div className="rounded-xl overflow-hidden border border-cyan-200 dark:border-cyan-700 shadow-md hover:shadow-lg transition">
                      <img
                        src={dog.profile_picture_url || "/dog2.jpeg"}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                  </div>
                </motion.div>
              ))}
            </div>
            </motion.section>

            {/* Contact Us Section */}
            <motion.section 
              className="py-20 bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                    Get in Touch
                  </h2>
                  <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                    We'd love to hear from you. Let's make a difference together.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">1234 Dog Street, Monroe, LA 71203</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">contact@underdogs.org</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">(318) 555-0123</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Hours</h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">Monday - Friday: 9am - 5pm</p>
                          <p className="text-gray-600 dark:text-gray-300">Saturday: 10am - 4pm</p>
                          <p className="text-gray-600 dark:text-gray-300">Sunday: Closed</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h4>
                      <div className="flex space-x-4">
                        <a href="#" className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                        <a href="#" className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h3>
                    <form className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="your.email@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subject
                        </label>
                      <input
                          type="text"
                          name="subject"
                          id="subject"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="What's this about?"
                      />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Message
                        </label>
                      <textarea
                          id="message"
                          name="message"
                        rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Your message here..."
                      />
                    </div>
                      <div>
                    <button
                          type="submit"
                          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
                    >
                      Send Message
                    </button>
                      </div>
                  </form>
                  </div>
                </div>
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
