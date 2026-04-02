// tailwind.config.js — TailwindCSS configuration with survival color palette
// Step 1: Scaffold only — theme extension
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1a2e1a",
          light: "#2d4a2d",
          dark: "#0d1a0d",
        },
        earth: {
          DEFAULT: "#3d2b1f",
          light: "#5c4033",
        },
        amber: {
          DEFAULT: "#c8861a",
          light: "#e8a020",
        },
        parchment: "#f0ead6",
      },
    },
  },
  plugins: [],
}