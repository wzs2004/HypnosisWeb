/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: '#007AFF',
        backgroundGray: '#F5F5F7',
        textBlack: '#1D1D1F',
        textGray: '#86868B',
        pureWhite: '#FFFFFF',
      },
      animation: {
        'spin-slow': 'spin 15s linear infinite',
      }
    },
  },
  plugins: [],
}