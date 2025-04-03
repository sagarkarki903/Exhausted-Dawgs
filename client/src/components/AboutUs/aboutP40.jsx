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

const AboutP40 = () => {


    //****************check if a user is logged in*****************/
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable

          const res = await axios.get(`${backendUrl}/auth/profile`, {
            withCredentials: true,
          });
          if (res.status === 200) {
            setLoggedIn(true);
          }
        } catch (err) {
          setLoggedIn(false); // Not logged in
        } finally {
          setLoading(false); // ✅ Done checking
        }
      };
    
      checkAuth();
    }, []);
    //**************************************************************** */


  return (
    <div className="flex flex-col min-h-screen bg-gray-200 text-black">
      {/* <Navbar className="text-gold" /> */}
      {loading ? null : (loggedIn ? <NavUser /> : <Navbar />)}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden bg-maroon-700 text-center text-gold border-b-8 border-gold">
          <motion.div
            className="relative z-10 px-4 md:px-6"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
              variants={fadeInUp}
            >
              About Project P-40
            </motion.h1>
            <motion.p
              className="max-w-3xl mx-auto mt-4 text-lg font-semibold"
              variants={fadeInUp}
            >
              Learn about our mission, history, and how you can get involved.
            </motion.p>
          </motion.div>
        </section>

        {/* Sections */}
        {[
          { title: "Introduction", bg: "bg-gray-100", border: "border-maroon-700", text: "text-maroon-900" },
          { title: "Scheduling a Walk", bg: "bg-maroon-600", border: "border-gold", text: "text-gold" },
          { title: "Create an Account", bg: "bg-gray-100", border: "border-maroon-700", text: "text-maroon-900" },
          { title: "Become a Marshal", bg: "bg-maroon-600", border: "border-gold", text: "text-gold" },
          { title: "Adoption Process & Donations", bg: "bg-gray-100", border: "border-maroon-700", text: "text-maroon-900" },
          { title: "History and Founder", bg: "bg-maroon-600", border: "border-gold", text: "text-gold" },
        ].map((section, index) => (
          <section
            key={index}
            className={`py-20 px-4 md:px-6 ${section.bg} border-8 ${section.border} rounded-lg shadow-xl my-16 mx-4 md:mx-12 lg:mx-24`}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <h2 className={`text-3xl font-bold ${section.text} text-center border-b-4 border-gold pb-4 mb-6`}>{section.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-black">
                  {section.title === "Introduction" &&
                    "Welcome to Project P-40! We strive to connect people with shelter dogs through our innovative adoption and walking programs."}
                  {section.title === "Scheduling a Walk" &&
                    "Our scheduling tool allows users to set up dog walks easily. Choose a time and location, and enjoy quality time with a furry friend!"}
                  {section.title === "Create an Account" &&
                    "Join our community by creating an account. This will allow you to schedule walks, track your history, and apply for adoption."}
                  {section.title === "Become a Marshal" &&
                    "Interested in taking a leadership role? Apply to become a Marshal and help manage dog walks and ensure safety."}
                  {section.title === "Adoption Process & Donations" &&
                    "Learn how our adoption process works and how your donations help support our mission of finding homes for dogs in need."}
                  {section.title === "History and Founder" &&
                    "Project P-40 was founded by passionate animal lovers dedicated to making a difference in the lives of shelter dogs and their future owners."}
                </p>
              </motion.div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default AboutP40;