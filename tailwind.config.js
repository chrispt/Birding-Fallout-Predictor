/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        score: {
          low: '#4CAF50',
          moderate: '#8BC34A',
          elevated: '#FFEB3B',
          high: '#FF9800',
          exceptional: '#F44336'
        }
      }
    },
  },
  plugins: [],
}
