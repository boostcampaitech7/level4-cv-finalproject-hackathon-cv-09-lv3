/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E5F6FF",
          100: "#C8EDFF",
          200: "#92DBFF",
          300: "#5CC8FF",
          400: "#26B6FF",
          500: "#009EF0",
          600: "#007FBF",
          700: "#005F8F",
          800: "#003F5F",
          900: "#001F30",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
