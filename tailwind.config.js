/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'rainbow-circle': 'conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)',
      },
    },
  },
  plugins: [],
}