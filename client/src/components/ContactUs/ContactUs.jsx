import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronUp, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Navbar } from "../NavAndFoot/Navbar";
import { Footer } from "../NavAndFoot/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollWidth, setScrollWidth] = useState("0%");

  useEffect(() => {
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
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 300);
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? `${(scrollPosition / docHeight) * 100}%` : "0%";
      setScrollWidth(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/contact`, formData);
      setSubmitStatus({ type: 'success', message: 'Message sent successfully!' });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-700 relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-cyan-600 z-50"
        style={{ width: scrollWidth }}
        animate={{ width: scrollWidth }}
        transition={{ duration: 0.2 }}
      />
      <Navbar onDarkModeToggle={toggleDarkMode} isDarkMode={isDarkMode} />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              We'd love to hear from you. Fill out the form and we'll get back to you soon.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700 flex flex-col gap-6 justify-center">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">contact@exhausteddawgs.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Address</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">123 Dog Street, Seattle, WA 98101</p>
                </div>
              </div>
              {/* Embedded Google Map */}
              <div className="mt-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <iframe
                  title="Our Location"
                  src="https://www.google.com/maps?q=123+Dog+Street,+Seattle,+WA+98101&output=embed"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 text-base font-semibold"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
                <AnimatePresence>
                  {submitStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-4 p-4 rounded-lg text-center ${
                        submitStatus.type === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {submitStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </main>
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
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronUp className="h-6 w-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default ContactUs; 