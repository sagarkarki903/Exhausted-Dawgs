// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-maroon-700",
    "text-maroon-800",
    "bg-gold-500",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          700: "#800000",
          800: "#660000",
        },
        gold: {
          500: "#FFD700",
        },
      },
    },
  },
  plugins: [],
}

  