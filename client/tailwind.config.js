/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        custom: "10px 10px 20px #bebebe, -10px -10px 20px #ffffff",
        neumorphic: "8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff",
        custom3d:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1), 4px 0 6px rgba(0, 0, 0, 0.1), -4px 0 6px rgba(0, 0, 0, 0.1)",
      },
      colors: {
        primary: {
          // DEFAULT: colors.green[500],
          DEFAULT: "hsl(var(--primary))",
          light: "#22C55E",
          dark: "#15803D",
        },
        
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
