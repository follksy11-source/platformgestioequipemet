/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F6F3",
        ink: "#161B1F",
        primary: {
          DEFAULT: "#1D3E4E",
          dark: "#122A35",
          light: "#2E5A70",
        },
        status: {
          disponible: "#3F7D63",
          panne: "#B3432B",
          maintenance: "#C97A1A",
        },
        line: "#D9D8D2",
      },
      fontFamily: {
        display: ["Newsreader", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
