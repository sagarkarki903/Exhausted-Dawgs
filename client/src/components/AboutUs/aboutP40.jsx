import React from "react";
import { motion } from "framer-motion";
import {
  PawPrint,
  CalendarDays,
  UserPlus,
  ShieldCheck,
  HeartHandshake,
  BookUser,
} from "lucide-react";

// Animation settings
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const sections = [
  {
    title: "Introduction",
    icon: <PawPrint className="text-maroon w-6 h-6" />,
    content:
      "Project P-40 is a nonprofit initiative devoted to improving the lives of shelter dogs through community-powered programs like Walk-a-Week. We’re driven by compassion, community, and the belief that every dog deserves a second chance.",
  },
  {
    title: "Scheduling a Walk",
    icon: <CalendarDays className="text-maroon w-6 h-6" />,
    content:
      "Use our platform to schedule walks with shelter dogs at your convenience. Once registered, simply pick a dog, select a time slot, and we’ll handle the rest — including reminders and updates.",
  },
  {
    title: "Create an Account",
    icon: <UserPlus className="text-maroon w-6 h-6" />,
    content:
      "To join the community, start by creating an account. This unlocks features like booking walks, applying to become a Marshal, and tracking your involvement with the shelter dogs.",
  },
  {
    title: "Become a Marshal",
    icon: <ShieldCheck className="text-maroon w-6 h-6" />,
    content:
      "Marshals are experienced volunteers who ensure safe and successful walks. Apply in your account dashboard to get started. Once approved, you’ll gain extra permissions and responsibilities.",
  },
  {
    title: "Adoption & Donations",
    icon: <HeartHandshake className="text-maroon w-6 h-6" />,
    content:
      "Interested in adopting? Submit an application through our platform and track your approval status. Donations are also welcome and go directly toward food, vet care, and supplies.",
  },
  {
    title: "History & Founder",
    icon: <BookUser className="text-maroon w-6 h-6" />,
    content:
      "Project P-40 began as a one-person mission to bridge the gap between shelters and the community. Today, we’re a tech-enabled grassroots movement helping dogs find their forever homes.",
  },
];

const AboutP40 = () => {
  return (
    <div className="relative bg-maroon text-white min-h-screen overflow-hidden">
      {/* 🐾 Background Pawprints */}
      <div
        className="absolute inset-0 bg-[url('/pawprint.svg')] bg-repeat opacity-5 z-0"
        style={{ backgroundSize: "80px" }}
        aria-hidden="true"
      />

      {/* Hero Section with Darker Gold Gradient */}
      <section className="relative z-10 bg-gradient-to-b from-[#E6BE00] to-[#edd585] text-maroon py-16 px-6 md:px-20 text-center shadow-inner">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow"
        >
          About Project P-40
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl max-w-3xl mx-auto italic text-maroon-700 drop-shadow"
        >
          “Saving one dog will not change the world, but for that one dog, the world will change forever.”
        </motion.p>
      </section>

      {/* Main Content */}
      <main className="relative z-10 pt-16 pb-24 px-6 md:px-20 space-y-10">
        <motion.div
          className="space-y-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {sections.map(({ title, content, icon }, index) => (
            <motion.section
              key={index}
              variants={fadeInUp}
              className="bg-white text-black rounded-2xl shadow-lg p-6 md:p-10 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gold rounded-full p-2 shadow-md animate-bounce">{icon}</div>
                <h2 className="text-2xl font-bold text-maroon">{title}</h2>
              </div>
              <p className="text-gray-800 leading-relaxed">{content}</p>
            </motion.section>
          ))}
        </motion.div>
      </main>

      {/* Desktop CTA */}
      <section className="hidden md:block relative z-10 text-center py-10 bg-maroon text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to make tails wag?</h2>
        <a
          href="/signup"
          className="inline-block bg-gold text-maroon font-semibold py-3 px-8 rounded-xl hover:bg-yellow-400 transition duration-300 shadow-md"
        >
          Join the Pack
        </a>
      </section>

      {/* Mobile CTA */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <a
          href="/signup"
          className="bg-gold text-maroon font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-400 transition duration-300"
        >
          Join the Pack
        </a>
      </div>
    </div>
  );
};

export default AboutP40;
