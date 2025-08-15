/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          green: "#16A34A",   // your X green
          blue:  "#2563EB",   // brand blue
          dark:  "#0B1220",   // near-black for headings
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};