module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#9CCC65",
          DEFAULT: "#8BC34A",
          dark: "#689F38",
          contrastText: "#212121",
        },
        secondary: {
          light: "#FF8A65",
          DEFAULT: "#FF8A65",
          dark: "#FF8A65",
          contrastText: "#757575",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
