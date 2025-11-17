/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",      // your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}" // all JS/TS/React files
  ],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        gradient: "gradient 8s ease infinite",
      },
    },
  },
  plugins: [],
}
