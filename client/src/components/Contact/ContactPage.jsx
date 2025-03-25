"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import axios from "axios";



const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export const ContactPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/auth/profile", {
          withCredentials: true,
        });
        if (res.status === 200) setLoggedIn(true);
      } catch (err) {
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-900 relative">
      {/* Background Paw Animation */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-gray-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            animate={{ y: [0, 10, 0], rotate: [0, 360] }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <PawPrint />
          </motion.div>
        ))}
      </motion.div>

      {/* Navbar */}
      <div className=" relative">{loggedIn ? <NavUser /> : <Navbar />}</div>

      {/* Main Section */}
      <main className="flex-1 relative z-10">
        <section className="py-20 px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-4xl font-bold text-center mb-6"
              variants={fadeInUp}
            >
              Contact Us
            </motion.h1>
            <motion.p
              className="text-center text-gray-600 max-w-xl mx-auto mb-10"
              variants={fadeInUp}
            >
              Have questions or suggestions? We’d love to hear from you!
            </motion.p>

            {/* Contact Form */}
            <motion.form
              className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 space-y-6"
              variants={fadeInUp}
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  placeholder="Type your message here"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-red-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </motion.form>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
