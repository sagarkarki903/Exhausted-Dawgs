import { motion } from "framer-motion"

export const Footer = () => {
  return (
    <motion.footer
      className="border-t border-gray-300 py-6 bg-background/80 backdrop-blur-sm relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
              Privacy Policy
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
