import React from "react"
import { motion, useAnimation, useMotionValue } from "framer-motion"

export const Footer = () => {
  const MiniDogAnimation = () => {
  const dogX = useMotionValue(0)
  const boneX = useMotionValue(100)
  const controls = useAnimation()

  React.useEffect(() => {
    const animateDog = async () => {
      await controls.start({ x: 100, transition: { duration: 2 } })
      await controls.start({ y: -20, transition: { duration: 0.3 } })
      await controls.start({ y: 0, transition: { duration: 0.3 } })
      await controls.start({ x: 0, transition: { duration: 2 } })
    }

    const animateBone = async () => {
      await boneX.set(100)
      await new Promise((resolve) => setTimeout(resolve, 4000))
      await boneX.set(-50)
    }

    const runAnimation = async () => {
      await Promise.all([animateDog(), animateBone()])
      runAnimation()
    }

    runAnimation()
  }, [controls, boneX])

  return (
    <svg
      width="200"
      height="100"
      viewBox="0 0 200 100"
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
    >
      <motion.path d="M15,70 Q25,50 35,70 Q45,90 55,70" stroke="#888" strokeWidth="2" fill="none" style={{ x: dogX }} />
      <motion.circle cx="25" cy="70" r="5" fill="#888" style={{ x: dogX }} />
      <motion.path d="M10,70 L20,60 L30,70 L20,80 Z" fill="#888" style={{ x: dogX }} animate={controls} />
      <motion.path
        d="M40,65 C40,65 50,65 50,70 C50,75 40,75 40,75"
        stroke="#888"
        strokeWidth="2"
        fill="none"
        style={{ x: boneX }}
      />
    </svg>
  )
}
  return (
        <motion.footer
                className="border-t border-gray-300 py-6 bg-background/80 backdrop-blur-sm relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MiniDogAnimation />
                <div className="px-4 md:px-6">
                  <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-2">
                      <img
                        src="/thumbnail_ulm_p40_underdogs_icon_ii_color_2024.png"
                        alt="Underdogs Logo"
                        width={30}
                        height={30}
                        className="w-8 h-8"
                      />
                      <span className="text-sm text-gray-500">© 2024 Underdogs. All rights reserved.</span>
                    </div>
                    <nav className="flex gap-4">
                      <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                        Privacy Policy - deploy_version
                      </a>
                      <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                        Terms of Service
                      </a>
                      <a className="text-sm text-gray-500 hover:text-primary transition-colors" href="#">
                        Contact
                      </a>
                    </nav>
                  </div>
                </div>
              </motion.footer>

  )
}
