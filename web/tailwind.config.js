/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-gold': '#FFC107',
        'game-gold-border': '#FFD700',
        'game-green': '#10B981',
        'game-green-light': '#4ADE80',
      },
      fontFamily: {
        'game': ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
