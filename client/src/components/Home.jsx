"use client"
import { motion} from "framer-motion"
import { Heart, PawPrint, Bone } from "lucide-react"
import { Navbar } from "./NavAndFoot/Navbar";
import { Footer } from "./NavAndFoot/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } },
}


export const Home = () => {

  return (
    <div className="flex flex-col min-h-screen bg-background text-gray-900">
      <Navbar />
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
        <section id="available" className="flex justify-center py-20">
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <motion.div key={i} variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.9 }}>
          <div className="rounded-lg bg-white border border-gray-300 shadow-md transition-shadow hover:shadow-2xl">
            <img
              src={`/dog.svg?height=100&width=100`}
              alt={`Dog ${i}`}
              width={50}
              height={50}
              className="p-4 h-96 w-full rounded-t-lg object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Buddy {i}</h3>
              <p className="text-sm text-gray-500">2 years old • Male • Friendly</p>
              <div className="mt-4 flex items-center gap-4">
                <button className="flex-1 rounded-md bg-red-900 px-4 py-2 text-white transition hover:bg-red-800">
                  Meet Me
                </button>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-yellow-500"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
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
        <section id="contact" className="py-20">
          <motion.div
            className="px-4 md:px-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Get in Touch</h2>
                <p className="mt-4 text-gray-500">
                  Have questions about adoption? We are here to help! Reach out to us and we wll get back to you as soon
                  as possible.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <div className="bg-white rounded-lg border border-gray-300 shadow-md">
                  <div className="p-6">
                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-md font-semibold" htmlFor="first-name">
                            First name
                          </label>
                          <input
                            className="w-full rounded-md border border-gray-200 px-3 py-2"
                            id="first-name"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-md font-semibold" htmlFor="last-name">
                            Last name
                          </label>
                          <input
                            className="w-full rounded-md border border-gray-200 px-3 py-2"
                            id="last-name"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-md font-semibold" htmlFor="email">
                          Email
                        </label>
                        <input
                          className="w-full rounded-md border border-gray-200 px-3 py-2"
                          id="email"
                          placeholder="Enter your email"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-md font-semibold" htmlFor="message">
                          Message
                        </label>
                        <textarea
                          className="w-full rounded-md border border-gray-200 px-3 py-2"
                          id="message"
                          placeholder="Enter your message"
                          rows={4}
                        />
                      </div>
                      <button className="w-full h-12 rounded-lg text-white font-semibold hover:cursor-pointer bg-red-900 hover:bg-amber-800">Send Message</button>
                    </form>
                  </div>
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

