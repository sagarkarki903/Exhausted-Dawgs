"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: "-100vh" },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: "-100vh",
      transition: {
        duration: 0.3,
      },
    },
  };

  const linkVariants = {
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

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-50 shadow-md">
      {/* Main Navbar */}
      <motion.div
        className="flex h-20 items-center justify-between px-4 md:px-8"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/thumbnail_ulm_p40_underdogs_icon_ii_color_2024.png"
            alt="Underdogs Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <img
            src="/thumbnail_ulm_p40_underdogs_wordmark_color_2024.png"
            alt="Underdogs"
            width={120}
            height={30}
            className="hidden sm:block"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-base">
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/"
          >
            Home
          </Link>
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/about"
          >
            About
          </Link>
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/dogs"
          >
            Dogs
          </Link>
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/gallery"
          >
            Gallery
          </Link>
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/rough-calendar"
          >
            Schedule
          </Link>
          <Link
            className="font-semibold hover:text-red-900 transition-colors"
            to="/contact-page"
          >
            Contact Us
          </Link>
          <Link to="/login">
            <button className="font-semibold hover:bg-yellow-400 transition-colors bg-yellow-500 px-4 py-2 rounded-md">
              Sign In
            </button>
          </Link>
        </nav>

        {/* Mobile Menu Button - Now changes to X when open */}
        <button
          className="md:hidden z-50 p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { rotate: 180 },
              closed: { rotate: 0 },
            }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.div>
        </button>
      </motion.div>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-0 bg-white z-40 flex flex-col"
            style={{ height: "100vh" }}
          >
            {/* Menu Links (Centered) with staggered animation */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 overflow-y-auto">
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/dogs", label: "Dogs" },
                { path: "/gallery", label: "Gallery" },
                { path: "/rough-calendar", label: "Schedule" },
                { path: "/contact-page", label: "Contact Us" },
              ].map((item, i) => (
                <motion.div
                  key={item.path}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={linkVariants}
                  className="w-full max-w-xs"
                >
                  <Link
                    className="block text-center py-4 text-2xl font-semibold text-gray-700 hover:text-red-900 transition-colors"
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                custom={6}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
                className="mt-8 w-full max-w-xs"
              >
                <Link
                  to="/login"
                  className="block w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <button className="w-full text-xl font-semibold hover:bg-yellow-400 transition-colors bg-yellow-500 px-6 py-3 rounded-md">
                    Sign In
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
