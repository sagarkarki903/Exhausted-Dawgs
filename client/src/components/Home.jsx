"use client"
import { useEffect, useState } from "react";
import { motion} from "framer-motion"
import { PawPrint, Bone } from "lucide-react"
import { Navbar } from "./NavAndFoot/Navbar";
import { NavUser } from "./NavAndFoot/NavUser";
import { NavAdmin } from "./NavAndFoot/NavAdmin";
import { Footer } from "./NavAndFoot/Footer";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import emailjs from "@emailjs/browser";
import { toast } from "react-hot-toast";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export const Home = () => {

  const backendUrl = import.meta.env.VITE_BACKEND; // Access the BACKEND variable
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [loading, setLoading] = useState(true); // NEW
  const [contact, setContact]   = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [sending, setSending]   = useState(false);


  
  useEffect(() => {
    axios
      .get(`${backendUrl}/dogs`)
      .then((response) => {
        const shuffledDogs = response.data.sort(() => 0.5 - Math.random()); // Shuffle the array
        setDogs(shuffledDogs);
      })
      .catch((error) => console.error("Error fetching dogs:", error));
  }, []);

   // Handle responsive display count
   useEffect(() => {
    const updateDisplayCount = () => {
      setDisplayCount(window.innerWidth < 1024 ? 2 : 4);
    };

    

    updateDisplayCount();
    window.addEventListener("resize", updateDisplayCount);
    return () => window.removeEventListener("resize", updateDisplayCount);
  }, []);

 // use the `name` attribute to know which field changed
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((c) => ({ ...c, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, message } = contact;

    // front-end validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      toast.error("Please fill in all fields before sending.");
      return;
    }

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
          toast.success("Your message was sent—thank you!");
          setContact({ firstName: "", lastName: "", email: "", message: "" });
        },
        (err) => {
          console.error("EmailJS error:", err);
          toast.error("Oops! Something went wrong.");
        }
      )
      .finally(() => setSending(false));
  };
  //****************check if a user is logged in and is an admin or other*****************/
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(""); // Track user role
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/auth/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setLoggedIn(true);
          setRole(res.data.role); // Capture role from response
        }
      } catch {
        setLoggedIn(false);
        setRole(""); // Reset role if not logged in
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, []);
//**************************************************************** */

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-900">
     {loading ? null : (
  !loggedIn ? <Navbar /> : role === "Admin" ? <NavAdmin /> : <NavUser />
)}

      <main className="flex-1">
        <section className="py-20 relative overflow-hidden bg-neutral-100">
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute z-2 text-gray-400"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                }}
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <PawPrint />
              </motion.div>
            ))}
          </motion.div>
          <div className="px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial="hidden"
                animate="visible"
                variants={staggerChildren}
              >
                <motion.div className="space-y-2 al" variants={fadeInUp}>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Perfect Companion
                  </h1>
                  <p className="max-w-[600px] font-semibold md:text-xl">
                    Give an underdog a chance at a forever home. Browse our available dogs and start your adoption
                    journey today.
                  </p>
                </motion.div>
                <motion.div className="flex flex-col gap-2 sm:flex-row" variants={fadeInUp}>
                        <a
                          href="/dogs"
                          className="inline-block rounded-lg bg-yellow-500 px-6 py-3 text-lg font-medium transition-colors hover:bg-yellow-400 text-center"
                        >
                          Meet Our Dogs
                        </a>
                        <button
                          className="rounded-lg shadow-md px-6 py-3 text-lg font-medium transition-colors hover:bg-red-800 hover:cursor-pointer hover:text-white"
                          onClick={() => navigate(`/about`)}
                        >
                          Learn More
                        </button>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="/thumbnail_ulm_p40_underdogs_icon_color_2024.png"
                  alt="Happy Dog Mascot"
                  width={600}
                  height={600}
                  className="mx-auto aspect-square object-contain lg:aspect-auto"
                />
              </motion.div>
            </div>
          </div>
        </section>
        <section id="available" className="flex justify-center pt-20">
          <motion.div
            className="container px-4 md:px-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h2
              className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-10"
              variants={fadeInUp}
            >
              Available Dogs
            </motion.h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {dogs.slice(0, displayCount).map((dog, index) => (
                    <motion.div key={index} variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9 }}>
                      <div className="rounded-lg bg-white border border-gray-300 shadow-md transition-shadow hover:shadow-2xl">
                        <img
                          src={dog.profile_picture_url || "/dog2.jpeg"}
                          alt={dog.name}
                          className="h-70 w-full rounded-t-lg object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{dog.name}</h3>
                          <p className="text-sm text-gray-500">{dog.age} years old • {dog.breed}</p>
                          <div className='flex p-4 gap-6'>         
                                        <button  className="flex-1 rounded-md w-full bg-red-900 px-4 py-2 text-white transition hover:bg-red-800 hover:cursor-pointer" onClick={() => navigate(`/dogs/${dog.id}`)}>
                                          Meet Me                      
                                        </button>
                          </div>
                        </div>
                      </div>
                      
                    </motion.div>
                    
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    className="rounded-lg shadow-md px-5 py-2 mb-6 text-md font-medium transition-colors hover:bg-red-800 hover:cursor-pointer bg-whitetext-black hover:text-white"
                    onClick={() => navigate(`/dogs`)}
                  >
                   More
                  </button>
                </div>

          </motion.div>
        </section>
        <section id="process" className="py-20 bg-neutral-100 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/5"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 100 + 50}px`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 20 + 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Bone />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="px-4 md:px-6 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-10"
              variants={fadeInUp}
            >
              Adoption Process
            </motion.h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {["Submit Application", "Meet Your Match", "Home Check", "Welcome Home"].map((step, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 text-center">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <PawPrint className="mx-auto h-12 w-12 text-red-900 mb-4" />
                      </motion.div>
                      <h3 className="font-bold text-lg">Step {i + 1}</h3>
                      <p className="text-md font-semibold text-gray-500 mt-2">{step}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
         {/* Contact on Home */}
        <section id="contact" className="py-20">
          <motion.div className="px-4 md:px-6" initial="hidden" whileInView="visible" variants={staggerChildren}>
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold">Get in Touch</h2>
                <p className="mt-4 text-gray-500">
                  Have questions about adoption? Reach out and we’ll get back to
                  you ASAP.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="bg-white rounded-lg border border-gray-300 shadow-md p-6">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block font-semibold mb-1">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={contact.firstName}
                          onChange={handleContactChange}
                          required
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block font-semibold mb-1">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={contact.lastName}
                          onChange={handleContactChange}
                          required
                          className="w-full border border-gray-300 rounded px-3 py-2"
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
                        required
                        className="w-full border border-gray-300  rounded px-3 py-2"
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
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Enter your message"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-red-900 text-white py-3 rounded hover:bg-amber-800 disabled:opacity-50"
                    >
                      {sending ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

