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
  visible: { transition: { staggerChildren: 0.2 } },
};

const sections = [
  {
    title: "Introduction",
    icon: <PawPrint className="text-maroon w-6 h-6" />,
    content: `Project P-40 Underdogs was born from a partnership with the Humane Society Adoption Center to shine a light on the love waiting inside every shelter dog. By matching community volunteers with dogs in need of connection, we help scared pups learn trust, playfulness, and confidence—one walk at a time. Every volunteer creates an account, signs a quick waiver, and picks an available slot under the watchful eye of a trained Marshal. With each step, dogs gain social skills and hearts gain hope.`,
  },
  {
    title: "Scheduling a Walk",
    icon: <CalendarDays className="text-maroon w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p>
          Scheduling a walk is vital for a dog’s socialization and well-being. Each
          walk provides exercise, affection, and a chance to build trust—key
          factors that increase adoption success.
        </p>
        <p>
          Walks run Tuesday–Saturday, 10 AM–3 PM under the supervision of a trained
          Marshal. Volunteers pick from available time slots and show up ready to
          make a difference.
        </p>
        <p>Dogs are classified into three categories:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-800">
          <li><strong>Gold</strong>: Easy to walk—perfect for first-timers.</li>
          <li><strong>Maroon</strong>: A bit more challenging—requires experience.</li>
          <li><strong>Grey</strong>: Non-walkable/aggressive—observe from a safe distance.</li>
        </ul>
        <a
          href="/schedule"
          className="inline-block mt-4 bg-gold text-maroon font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition"
        >
          Schedule a Walk
        </a>
      </div>
    ),
  },
  {
    title: "Create an Account",
    icon: <UserPlus className="text-maroon w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside text-gray-800 space-y-2">
          <li>Create your free account and sign the quick waiver.</li>
          <li>Log in and complete your volunteer profile.</li>
          <li>Explore available walks and dog classifications.</li>
          <li>Schedule your first walk and join the pack!</li>
        </ol>
        <a
          href="/signup"
          className="inline-block mt-2 bg-gold text-maroon font-semibold py-2 px-4 rounded hover:bg-yellow-400 transition"
        >
          Create an Account
        </a>
      </div>
    ),
  },
  {
    title: "Become a Marshal",
    icon: <ShieldCheck className="text-maroon w-6 h-6" />,
    content: `Our Marshals are the champions of Project P-40: experienced volunteers who ensure every walk is safe, fun, and rewarding. They receive specialized training, manage scheduling slots, and mentor fellow walkers—all while making a direct impact on each dog’s journey to a forever home. Ready to lead the pack? Submit a Marshal application in your account dashboard and be the change your community needs.`,
  },
  {
    title: "Adoption & Donations",
    icon: <HeartHandshake className="text-maroon w-6 h-6" />,
    content: `Whether you have room in your home or in your heart, you can make a difference. Soon, you’ll be able to apply to adopt a dog directly through Project P-40 or donate to provide food, medical care, and enrichment. Every adoption transforms two lives—yours and the dog’s—and every donation fuels our mission of compassion. Stay tuned for our Adoption & Donations portal launch.`,
  },
  {
    title: "Founder",
    icon: <BookUser className="text-maroon w-6 h-6" />,
    content: (
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* circular photo with maroon hex border */}
        <img
          src="/christine_berry.jpg"
          alt="Dr. Christine Berry"
          className="w-48 h-48 rounded-full object-cover border-4 border-[#800000] shadow-lg"
        />

        {/* bio text */}
        <div className="space-y-2 text-gray-800">
          <p className="font-semibold text-lg text-maroon-800">
            Dr. Christine Berry
          </p>
          <p>
            Associate Professor of Risk Management & Insurance and Director of the Small
            Business Risk Management Institute at the University of Louisiana at Monroe since 2001.
          </p>
          <p>
            As the visionary founder of Project P-40 Underdogs, Dr. Berry leveraged her decades
            of industry and academic expertise to build a volunteer-powered walking program—
            uniting students, organizations, and the community around shelter dogs. She personally
            marshals walks, mentoring volunteers and ensuring every dog receives the care and
            socialization they need.
          </p>
          <p>
            Under her leadership, Project P-40 has become a model of community engagement,
            seamlessly integrating ULM’s student groups and elevating the mission of humane
            education across Northeast Louisiana.
          </p>
        </div>
      </div>
    ),
  },
];

const AboutP40 = () => (
  <div className="relative bg-maroon text-white min-h-screen overflow-hidden">
    {/* Pawprint bg */}
    <div
      className="absolute inset-0 bg-[url('./pawprint.svg')] bg-repeat opacity-5 z-0"
      style={{ backgroundSize: "80px" }}
      aria-hidden="true"
    />

    {/* Hero */}
    <section className="relative z-10 bg-gradient-to-b from-[#E6BE00] to-[#f5e6b6] text-maroon py-16 px-6 md:px-20 text-center shadow-inner">
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
        “Saving one dog will not change the world, but for that one dog,
        the world will change forever.”
      </motion.p>
    </section>

    {/* Content */}
    <main className="relative z-10 pt-16 pb-24 px-6 md:px-20 space-y-10">
      <motion.div
        className="space-y-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {sections.map(({ title, content, icon }, idx) => (
          <motion.section
            key={idx}
            variants={fadeInUp}
            className="bg-white text-black rounded-2xl shadow-lg p-6 md:p-10 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gold rounded-full p-2 shadow-md animate-bounce">
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-maroon">{title}</h2>
            </div>
            <div className="text-gray-800 leading-relaxed">{content}</div>
          </motion.section>
        ))}
      </motion.div>
    </main>

    {/* CTAs */}
    <section className="hidden md:block relative z-10 text-center py-10 bg-maroon text-white">
      <h2 className="text-2xl font-bold mb-4">Ready To Make Some Tails Wag?</h2>
      <a
        href="/signup"
        className="inline-block bg-gold text-maroon font-semibold py-3 px-8 rounded-xl hover:bg-yellow-400 transition duration-300 shadow-md"
      >
        Join the Pack
      </a>
    </section>
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

export default AboutP40;
