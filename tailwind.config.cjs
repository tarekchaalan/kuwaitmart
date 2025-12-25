/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '1120px',
      lg: '1280px',
      xl: '1536px',
    },
    extend: {},
  },
  plugins: [],
};


