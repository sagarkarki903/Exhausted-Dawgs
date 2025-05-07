import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../NavAndFoot/Navbar";
import { NavUser } from "../NavAndFoot/NavUser";
import { Footer } from "../NavAndFoot/Footer";
import { PawPrint, Heart, Calendar, UserPlus, Award, History, ArrowRight, DollarSign } from "lucide-react"
import axios from "axios"; 

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

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
        } catch {
          setLoggedIn(false); // Not logged in
        } finally {
          setLoading(false); // ✅ Done checking
        }
      };
    
      checkAuth();
    }, []);
    //**************************************************************** */

// Section data with icons and more detailed content
  const sections = [
    {
      title: "Introduction",
      icon: <PawPrint className="h-10 w-10" />,
      bg: "bg-white",
      border: "border-red-700",
      text: "text-red-900",
      content: "Project P-40 Underdogs was born from a partnership with the Humane Society Adoption Center to shine a light on the love waiting inside every shelter dog. By matching community volunteers with dogs in need of connection, we help scared pups learn trust, playfulness, and confidence—one walk at a time. Every volunteer creates an account, signs a quick waiver, and picks an available slot under the watchful eye of a trained Marshal. With each step, dogs gain social skills and hearts gain hope.",
      image: "/volunteer.jpg?height=300&width=500",
      imageAlt: "Dogs and volunteers at Project P-40",
    },
    {
      title: "Scheduling a Walk",
      icon: <Calendar className="h-10 w-10" />,
      bg: "bg-red-900",
      border: "border-yellow",
      text: "text-white",
      content:
        "Scheduling a walk is vital for a dog’s socialization and well-being. Each walk provides exercise, affection, and a chance to build trust—key factors that increase adoption success. Walks run Tuesday–Saturday, 10 AM–3 PM under the supervision of a trained Marshal. Volunteers pick from available time slots and show up ready to make a difference. Dogs are classified into three categories: Gold: Easy to walk—perfect for first-timers. Maroon: A bit more challenging—requires experience. Grey: Non-walkable/aggressive—observe from a safe distance.",
      image: "/walk.jpg?height=300&width=500",
      imageAlt: "Person scheduling a dog walk on mobile device",
    },
    {
      title: "Create an Account",
      icon: <UserPlus className="h-10 w-10" />,
      bg: "bg-white",
      border: "border-red-700",
      text: "text-red-900",
      content:
        "Joining our community is quick and easy. By creating an account, you'll gain access to our full range of features including walk scheduling, personal walking history, and adoption applications. Your profile helps us match you with compatible dogs and keeps track of your volunteer hours. We value your privacy and ensure all personal information is securely stored. Become part of our growing network of dog lovers making a difference in your community.",
      image: "/account.jpg?height=300&width=500",
      imageAlt: "Person creating an account on laptop",
    },
    {
      title: "Become a Marshal",
      icon: <Award className="h-10 w-10" />,
      bg: "bg-red-900",
      border: "border-yellow",
      text: "text-white",
      content:
        "Our Marshals are the champions of Project P-40: experienced volunteers who ensure every walk is safe, fun, and rewarding. They receive specialized training, manage scheduling slots, and mentor fellow walkers—all while making a direct impact on each dog’s journey to a forever home. Ready to lead the pack? Submit a Marshal application in your account dashboard and be the change your community needs.",
      image: "/marshal.jpeg?height=300&width=500",
      imageAlt: "Marshal helping with dog walking",
    },
    {
      title: "Adoption Process & Donations",
      icon: <Heart className="h-10 w-10" />,
      bg: "bg-white",
      border: "border-red-700",
      text: "text-red-900",
      content:
        "Whether you have room in your home or in your heart, you can make a difference. Soon, you’ll be able to apply to adopt a dog directly through Project P-40 or donate to provide food, medical care, and enrichment. Every adoption transforms two lives—yours and the dog’s—and every donation fuels our mission of compassion. Stay tuned for our Adoption & Donations portal launch.",
        image: "/Cherie&Buddy.jpg?height=300&width=500",
      imageAlt: "Family adopting a dog",
    },
    {
      title: "History and Founder",
      icon: <History className="h-10 w-10" />,
      bg: "bg-red-900",
      border: "border-yellow",
      text: "text-white",
      content:
        "Project P-40 was founded by Dr. Christine Berry. She is the Associate Professor of Risk Management & Insurance and Director of the Small Business Risk Management Institute at the University of Louisiana at Monroe since 2001. As the visionary founder of Project P-40 Underdogs, Dr. Berry leveraged her decades of industry and academic expertise to build a volunteer-powered walking program— uniting students, organizations, and the community around shelter dogs. She personally marshals walks, mentoring volunteers and ensuring every dog receives the care and socialization they need. Under her leadership, Project P-40 has become a model of community engagement, seamlessly integrating ULM’s student groups and elevating the mission of humane education across Northeast Louisiana.",
       image: "/cberry.png?height=300&width=500",
      imageAlt: "Founder of Project P-40 with dogs",
    },
  ]


  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* <Navbar className="text-yellow" /> */}
      {loading ? null : (loggedIn ? <NavUser /> : <Navbar />)}
      <main className="flex-1">
        {/* Hero Section with Parallax Effect */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-r from-red-800 to-red-900 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="absolute inset-0 bg-[url('./DogSilloutte.png?height=400&width=400')] bg-contain bg-center bg-no-repeat"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
            >
              <motion.div variants={fadeInUp} className="inline-block mb-6 p-2 bg-yellow/20 rounded-full">
                <PawPrint className="h-10 w-10 text-yellow" />
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6"
                variants={fadeInUp}
              >
                About <span className="text-yellow-400">Project P40</span>
              </motion.h1>

              <motion.p className="text-xl md:text-2xl font-medium text-gray-100 mb-8" variants={fadeInUp}>
                Connecting people with shelter dogs through compassion, community, and commitment.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <a
                  href="/rough-calendar"
                  className="px-8 py-3 bg-yellow-400 text-red-900 font-semibold rounded-full hover:bg-yellow/90 transition-colors duration-300 flex items-center gap-2"
                >
                  Schedule a Walk <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://www.clover.com/pay-widgets/d682cd3a-15d8-4ba1-8bfb-b0d73eeb867b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center gap-2"
                >
                  Donate Now <DollarSign className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative paw prints */}
          <div className="absolute bottom-0 left-0 w-full h-20 overflow-hidden">
            <div className="absolute -bottom-10 left-0 w-full flex justify-around">
              {[...Array(10)].map((_, i) => (
                <PawPrint key={i} className="h-10 w-10 text-yellow-400/20 transform rotate-45" />
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-neutral-100">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-red-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Project P-40 believes that every dog deserves a chance at happiness. Through our innovative programs, we
                aim to reduce shelter populations, increase adoption rates, and create meaningful connections between
                people and dogs. Together, we can make a difference—one walk, one wag, one adoption at a time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content Sections */}
        <div className="container mx-auto px-4 md:px-6 py-12">
          {sections.map((section, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.section
                key={index}
                className={`py-16 px-6 md:px-10 ${section.bg} rounded-2xl shadow-xl my-12 overflow-hidden`}
                style={{ borderLeft: isEven ? "8px solid #8B0000" : "8px solid #FFD700" }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-10`}>
                  <motion.div className="lg:w-1/2" variants={isEven ? fadeInLeft : fadeInRight}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-full ${isEven ? "bg-red-100" : "bg-red-800"}`}>
                        {section.icon}
                      </div>
                      <h2 className={`text-3xl font-bold ${section.text}`}>{section.title}</h2>
                    </div>
                    <p className={`text-lg leading-relaxed mb-6 ${isEven ? "text-gray-800" : "text-white"}`}>{section.content}</p>
                  </motion.div>

                  <motion.div className="lg:w-1/2" variants={isEven ? fadeInRight : fadeInLeft}>
                    <img
                      src={section.image || "/placeholder.svg"}
                      alt={section.imageAlt}
                      className="w-full h-auto rounded-xl shadow-lg object-cover"
                      style={{ maxHeight: "400px" }}
                    />
                  </motion.div>
                </div>
              </motion.section>
            )
          })}
        </div>


        {/* Call to Action */}
        <section id="donate" className="py-20 bg-red-900 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Make a Difference Today</h2>
              <p className="text-xl text-gray-200 mb-8">
                Your support helps us continue our mission of connecting people with shelter dogs. Whether through
                volunteering, donations, or adoption, every contribution matters.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/rough-calendar"
                  className="px-8 py-3 bg-yellow-400 text-red-900 font-semibold rounded-full hover:bg-yellow-400/90 transition-colors duration-300"
                >
                  Schedule a Walk
                </a>
                <a
                  href="https://www.clover.com/pay-widgets/d682cd3a-15d8-4ba1-8bfb-b0d73eeb867b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-300"
                >
                  Donate Now
                </a>
                <a
                  href="/contact-page"
                  className="px-8 py-3 bg-white text-red-900 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300"
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
     
      </main>
      <Footer />
    </div>
  );
};

export default AboutP40;