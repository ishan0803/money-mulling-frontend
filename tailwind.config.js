/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          base: "#09090b",
          panel: "#18181b",
          card: "#27272a",
          floating: "rgba(24, 24, 27, 0.6)",
        },
        accents: {
          primary: "#10b981",
          primary_glow: "rgba(16, 185, 129, 0.2)",
          danger: "#ef4444",
          danger_glow: "rgba(239, 68, 68, 0.2)",
          warning: "#f59e0b",
          info: "#3b82f6",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#a1a1aa",
          tertiary: "#52525b",
        }
      },
      fontFamily: {
        heading: ["Geist", "Satoshi", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
