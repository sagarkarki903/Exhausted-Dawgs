/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
};
