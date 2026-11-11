/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#090d16",
          card: "#111827",
          border: "#1e293b",
          accent: "#38bdf8",
          sidebar: "#0b0f19"
        }
      }
    },
  },
  plugins: [],
}
