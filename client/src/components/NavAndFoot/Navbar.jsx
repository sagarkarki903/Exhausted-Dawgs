"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from 'react-router-dom'
import { Moon, Sun } from "lucide-react"

export const Navbar = ({ children, onDarkModeToggle, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false) // 🔹 Toggle mobile menu state

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-50 shadow-md">
      <motion.div
        className="flex h-20 items-center justify-between px-4 md:px-8"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo Section */}
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
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/">Home</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/about">About</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/dogs">Dogs</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/gallery">Gallery</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/rough-calendar">Schedule</Link>
          <Link className="font-semibold hover:text-red-900 transition-colors" to="/contact-page">Contact Us</Link>
          <button
            onClick={onDarkModeToggle}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
          <Link to="/login">
            <button className="font-semibold hover:bg-yellow-400 transition-colors bg-yellow-500 px-4 py-2 rounded-md">
              Sign In
            </button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={onDarkModeToggle}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-800 shadow-lg p-4 space-y-4"
        >
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/">Home</a>
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/about">About</a>
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/dogs">Dogs</a>
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/gallery">Gallery</a>
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/rough-calendar">Schedule</a>
          <a className="block font-semibold text-gray-700 dark:text-gray-300 hover:text-red-900" href="/contact-page">Contact Us</a>
          <Link to="/login">
            <button className="w-full font-semibold hover:bg-yellow-400 transition-colors bg-yellow-500 px-4 py-2 rounded-md">
              Sign In
            </button>
          </Link>
        </motion.div>
      )}
    </header>
  )
}
