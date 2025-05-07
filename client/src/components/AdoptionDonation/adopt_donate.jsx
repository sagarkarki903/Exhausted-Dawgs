import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, PawPrint } from "lucide-react";

// Animation settings
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const AdoptDonate = () => (
  <div className="relative bg-maroon text-white min-h-screen overflow-hidden">
    {/* Pawprint Background */}
    <div
      className="absolute inset-0 bg-[url('/pawprint.svg')] bg-repeat opacity-5 z-0"
      style={{ backgroundSize: "80px" }}
      aria-hidden="true"
    />

    {/* Hero Section */}
    <section className="relative z-10 bg-gradient-to-b from-[#E6BE00] to-[#f5e6b6] text-maroon py-16 px-6 md:px-20 text-center shadow-inner">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow"
      >
        Adopt or Donate
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl md:text-2xl max-w-3xl mx-auto italic text-maroon-700 drop-shadow"
      >
        Change a life. Start with one step.
      </motion.p>
    </section>

    {/* Main Content */}
    <main className="relative z-10 pt-16 pb-24 px-6 md:px-20 space-y-12">
      <motion.div
        className="space-y-12"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Adoption Section */}
        <motion.section
          variants={fadeInUp}
          className="bg-white text-black rounded-2xl shadow-lg p-6 md:p-10 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gold rounded-full p-2 shadow-md animate-bounce">
              <HeartHandshake className="text-maroon w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-maroon">Adoption</h2>
          </div>
          <p className="text-gray-800 leading-relaxed mb-6">
            Adoption is more than rescuing a dog—it’s transforming two lives.
            Every dog adopted through Project P-40 Underdogs gains a loving home, and every adopter
            gains a loyal companion. Shelter environments can be stressful for dogs, and your
            compassion can give them a second chance to thrive. Ready to meet your new best friend?
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/dogs"
              className="inline-block bg-gold text-maroon font-semibold py-3 px-8 rounded-xl hover:bg-yellow-400 transition duration-300 shadow-md"
            >
              Meet Our Pups
            </a>
            <a
              href="https://petstablished.com/adoptions/personal-information?application_type=Adopt&donation_section=false&form_id=13973&form_type=generic&generic_form_id=13973&pet_id=263621&section=1&selected_pets=false"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gold text-maroon font-semibold py-3 px-8 rounded-xl hover:bg-yellow-400 transition duration-300 shadow-md"
            >
              Adoption Application
            </a>
          </div>
        </motion.section>

        {/* Donation Section */}
        <motion.section
          variants={fadeInUp}
          className="bg-white text-black rounded-2xl shadow-lg p-6 md:p-10 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gold rounded-full p-2 shadow-md animate-bounce">
              <PawPrint className="text-maroon w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-maroon">Donations</h2>
          </div>
          <p className="text-gray-800 leading-relaxed mb-6">
            Your donation directly supports the dogs of Project P-40.
            Funds provide food, veterinary care, enrichment supplies, and resources that
            keep the Walk-A-Week program running strong. Every dollar counts in creating brighter futures
            for shelter dogs waiting for a home.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.clover.com/pay-widgets/d682cd3a-15d8-4ba1-8bfb-b0d73eeb867b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gold text-maroon font-semibold py-3 px-8 rounded-xl hover:bg-yellow-400 transition duration-300 shadow-md"
            >
              Donate
            </a>
          </div>
        </motion.section>
      </motion.div>
    </main>
  </div>
);

export default AdoptDonate;



