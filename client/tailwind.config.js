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
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
