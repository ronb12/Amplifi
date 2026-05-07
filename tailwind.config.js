/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#2563eb',
        'brand-dark': '#0f0f0f'
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
