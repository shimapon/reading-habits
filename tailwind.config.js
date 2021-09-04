module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#757ce8",
          DEFAULT: "#3f50b5",
          dark: "#002884",
          contrastText: "#ffffff",
        },
        secondary: {
          light: "#ff7961",
          DEFAULT: "#f44336",
          dark: "#ba000d",
          contrastText: "#000000",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
