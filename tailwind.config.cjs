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
    extend: {
      zIndex: {
        // Semantic z-index scale for consistent layering
        'dropdown': '10',
        'category': '20',
        'header': '30',
        'drawer': '40',
        'modal-backdrop': '50',
        'modal': '60',
        'toast': '70',
        'auth-modal': '100',
      },
    },
  },
  plugins: [],
};


