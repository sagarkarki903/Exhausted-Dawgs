"use client"
import { motion } from "framer-motion"
import { PawPrint, Bone, Dog } from "lucide-react"


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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/10 to-secondary/10 relative overflow-hidden">
      {pawPrints.map((style, index) => (
        <motion.div
          key={index}
          className="absolute text-primary/20"
          style={style}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 }}
        >
          <PawPrint size={40} />
        </motion.div>
      ))}
      <motion.div
        className="absolute top-20 left-10 text-secondary/30"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear"
        }}
      >
        <Bone size={60} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-primary/30"
        animate={{ rotate: -360 }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear"
        }}
      >
        <Dog size={80} />
      </motion.div>
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md p-8 bg-background shadow-lg rounded-lg">
            <div className="space-y-2 items-center text-center mb-4 flex flex-col">
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/thumbnail_ulm_p40_underdogs_icon_ii_color_2024.png"
                  alt="Underdogs Logo"
                  width={60}
                  height={60}
                  className="w-16 h-16"
                />
                <img
                  src="/thumbnail_ulm_p40_underdogs_wordmark_color_2024.png"
                  alt="Underdogs"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                />
              </motion.div>
              <div className="text-2xl font-bold">Welcome Back</div>
              <div className="text-muted-foreground">
                Sign in to your account to continue your adoption journey
              </div>
            </div>
            <div className="space-y-4 flex flex-col">
              <motion.div className="space-y-2" variants={fadeIn}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </motion.div>
              <motion.div className="space-y-2" variants={fadeIn}>
                <div className="flex items-center justify-between">
                  <label htmlFor="password">Password</label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </motion.div>
              <motion.div variants={fadeIn}>
                <button className="w-full" size="lg">
                  Sign In
                </button>
              </motion.div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <hr />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <motion.div className="grid grid-cols-2 gap-4" variants={fadeIn}>
                <button className="w-full bg-primary text-primary-foreground">
                  Google
                </button>
                <button className="w-full">
                  Facebook
                </button>
              </motion.div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="text-sm text-muted-foreground"
                variants={fadeIn}
              >
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Sign up
                </a>
              </motion.div>
              <motion.div variants={fadeIn}>
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Return to home
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
      <footer className="py-6 border-t bg-background/50 backdrop-blur-sm">
        <div className="container flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Underdogs. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
