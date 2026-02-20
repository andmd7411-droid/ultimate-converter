/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#6366f1',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
      }
    },
  },
  plugins: [],
}
