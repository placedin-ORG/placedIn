/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
        borderColor: ['hover'], // Ensure hover for border color is enabled
    },
},
  plugins: [ require('tailwind-scrollbar'),],
};
