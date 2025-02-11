"use client"
import { motion } from "framer-motion"
import { PawPrint, Bone, Dog, Eye, EyeOff } from "lucide-react"
import { Footer } from "./NavAndFoot/Footer";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";

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
    
const navigate = useNavigate() //Initialize useNavigate
    
//..................signup logic................................................
const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
});
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 // Auto Scroll Up When Error or Success Message Appears
 useEffect(() => {
    if (error || message) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error, message]);

  // Handle Input Change
const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //for password eye on and eye off
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);


    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        setLoading(false);
        return;
      }

   try {
      const response = await axios.post("http://localhost:8080/log-sign/register", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setMessage(response.data.message);
      setFormData({firstname:"", lastname: "", username: "", email: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        navigate('/login');
      }, 2000)

    } catch (err) {
      setError(err.response?.data?.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };
  //...................signup logic end................................


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9fafb] to-[#f3f4f6] relative overflow-hidden">
      {pawPrints.map((style, index) => (
        <motion.div
          key={index}
          className="absolute text-gray-300"
          style={style}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 }}
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

 {/*............................. SingUP Form ...........................................*/}
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
              <h2 className="text-2xl font-bold mt-4 text-gray-800">Create an Account</h2>
              <p className="text-gray-500">Join us and find your perfect companion!</p>
            </div>

            {/* Success/Error Messages */}
            {message && <p className="text-green-500 text-center">{message}</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}


           {/*.............. Signup Form Logic .............*/}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="firstname" className="block font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstname"
                  type="text"
                  name="firstname"
                  placeholder="Enter your first name"
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
                  type="text"
                  name="lastname"
                  placeholder="Enter your last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Username */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="username" className="block font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>
                {/* Email */}
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]"
                />
              </motion.div>

              {/* Password */}
              <motion.div className="space-y-2 relative" variants={fadeIn}>
                <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]" />
                  <button type="button" onClick={togglePassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
              {/* Confirm Password */}
              <motion.div className="space-y-2 relative" variants={fadeIn}>
                <label htmlFor="confirmPassword" className="block font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#8B2232]" />
                  <button type="button" onClick={toggleConfirmPassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
              
              <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ${
                        loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#8B2232] hover:bg-[#a32a3e]"
                    }`}
                    >
                    {loading ? "Signing Up..." : "Sign Up"}
                </motion.button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account? <Link to="/login" className="text-[#8B2232] hover:underline">Sign in</Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}
