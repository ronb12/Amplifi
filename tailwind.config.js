/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#2563EB',
        'brand-dark': '#0F0F0F',
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
