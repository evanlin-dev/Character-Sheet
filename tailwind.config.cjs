const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["'Cinzel'", "serif"],
        crimson: ["'Crimson Text'", "serif"],
      },
    },
  },
  darkMode: "class",
  corePlugins: {
    preflight: false, // Preserve existing styles.css resets
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#c9ad6a",
              foreground: "#2d1b00",
              50: "#fdf8ee",
              100: "#f7edcc",
              200: "#efd99a",
              300: "#e4c068",
              400: "#d9a83d",
              500: "#c9ad6a",
              600: "#a08a4e",
              700: "#786638",
              800: "#504322",
              900: "#28210f",
            },
            danger: {
              DEFAULT: "#8b0000",
              foreground: "#fff",
            },
          },
        },
      },
    }),
  ],
};
