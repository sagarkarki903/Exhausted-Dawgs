"use client"
import { motion } from "framer-motion"
import { PawPrint, Bone, Dog, Eye, EyeOff } from "lucide-react"
import { Footer } from "./NavAndFoot/Footer";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

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

export default function SignUp() {
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Walker",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // scroll to top on toast
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const togglePassword = () => setShowPassword(p => !p);
  const toggleConfirmPassword = () => setShowConfirmPassword(p => !p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND;
      const { data } = await axios.post(
        `${backendUrl}/log-sign/register`,
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(data.message);
      // reset form
      setFormData({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Walker",
      });
      // redirect after brief delay
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      const msg = err.response?.data?.message || "Server error, please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9fafb] to-[#f3f4f6] relative overflow-hidden">
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
                alt="Logo"
                className="w-16 h-16 mx-auto"
              />
              <h2 className="text-2xl font-bold mt-4 text-gray-800">Create an Account</h2>
              <p className="text-gray-500">Join us and find your perfect companion!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="firstname" className="block font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Last Name */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="lastname" className="block font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Username */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="username" className="block font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Email */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="email" className="block font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Password */}
              <motion.div className="space-y-2 relative" variants={fadeIn}>
                <label htmlFor="password" className="block font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div className="space-y-2 relative" variants={fadeIn}>
                <label htmlFor="confirmPassword" className="block font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Role */}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="Walker">Walker</option>
              </select>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#8B2232] hover:bg-[#a32a3e]"
                }`}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </motion.button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-[#8B2232] hover:underline">Sign in</Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
