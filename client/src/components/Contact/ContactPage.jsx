"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import emailjs from "@emailjs/browser";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export const ContactPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ► Contact form state
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND;
        const res = await fetch(`${backendUrl}/auth/profile`, {
          credentials: "include",
        });
        if (res.ok) setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ► Handle input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((c) => ({ ...c, [name]: value }));
  };

  // ► Handle form submission via EmailJS
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          first_name: contact.firstName,
          last_name: contact.lastName,
          from_email: contact.email,
          message: contact.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          alert("Your message was sent—thank you!");
          setContact({ firstName: "", lastName: "", email: "", message: "" });
        },
        (err) => {
          console.error("EmailJS error:", err);
          alert("Oops! Something went wrong.");
        }
      )
      .finally(() => setSending(false));
  };

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
      <div className="relative">
        {loading ? null : loggedIn ? <NavUser /> : <Navbar />}
      </div>

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
              onSubmit={handleContactSubmit}
              className="bg-white rounded-lg border border-gray-200 shadow-lg p-8 space-y-6"
              variants={fadeInUp}
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block font-semibold mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={contact.firstName}
                    onChange={handleContactChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block font-semibold mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={contact.lastName}
                    onChange={handleContactChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={contact.email}
                  onChange={handleContactChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="message" className="block font-semibold mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  value={contact.message}
                  onChange={handleContactChange}
                  rows="4"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  placeholder="Type your message here"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-red-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send Message"}
              </button>
            </motion.form>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
