/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        panel: "#0F0F0F",
        accent: "#00F5A0",
        accentSoft: "rgba(0,245,160,0.1)",
        muted: "#A3A3A3",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
