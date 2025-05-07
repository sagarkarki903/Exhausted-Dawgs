"use client"
import { motion } from "framer-motion"
import { PawPrint, Bone, Dog, MoveLeft } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Footer } from "./NavAndFoot/Footer";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";  // ← make sure Toaster is mounted in your App

const fadeIn = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
}

const pawPrints = [
  { top: "10%", left: "5%" },
  { top: "20%", right: "10%" },
  { bottom: "15%", left: "8%" },
  { bottom: "25%", right: "5%" }
]

export default function LoginPage() {
  const navigate = useNavigate();

  // Login Form State
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Scroll to top when loading (optional)
  useEffect(() => {
    if (loading) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loading]);

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND;
       await axios.post(
        `${backendUrl}/log-sign/login-server`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Show success toast
      toast.success("Logged in successfully!");
      // Redirect
      navigate("/profile");

    } catch (err) {
      // Grab server error message if present
      const message = err.response?.data?.message || "Login failed. Please try again.";
      // Show error toast
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9fafb] to-[#f3f4f6] relative overflow-hidden">
      <motion.div
        className="flex gap-4 my-4 text-black px-4 py-2 w-56 items-center"
        whileHover={{ scale: 1.03 }}
      >
        <MoveLeft />
        <Link to="/" className="font-semibold text-xl hover:text-red-900">
          Back to Home
        </Link>
      </motion.div>

      {pawPrints.map((style, idx) => (
        <motion.div
          key={idx}
          className="absolute text-gray-300"
          style={style}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.2 }}
        >
          <PawPrint size={40} />
        </motion.div>
      ))}
      <motion.div
        className="absolute top-20 left-10 text-gray-300"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Bone size={60} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-gray-300"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Dog size={80} />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="w-screen max-w-md p-8 bg-white shadow-xl rounded-lg">
            <div className="text-center mb-6">
              <motion.img
                src="/thumbnail_ulm_p40_underdogs_icon_ii_color_2024.png"
                alt="Underdogs Logo"
                width={60}
                height={60}
                className="w-16 h-16 mx-auto"
              />
              <h2 className="text-2xl font-bold mt-4 text-gray-800">Welcome Back</h2>
              <p className="text-gray-500">Sign in to continue your adoption journey</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="emailOrUsername" className="block font-medium text-gray-700">
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  name="emailOrUsername"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              <motion.div className="space-y-2" variants={fadeIn}>
                <div className="flex justify-between">
                  <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm text-[#8B2232] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#8B2232] hover:bg-[#a32a3e]"
                }`}
              >
                {loading ? "Signing In..." : "Sign In"}
              </motion.button>
            </form>

           

            <div className="text-center text-sm text-gray-500 mt-4">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-[#8B2232] hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              <Link to="/" className="hover:text-[#8B2232]">Return to home</Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}
