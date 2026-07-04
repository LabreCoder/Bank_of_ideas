/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files to know which classes are actually used,
  // so unused CSS gets removed from the final build.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Single accent color used across the app for active states,
        // primary buttons and highlights. Keeping it centralized here
        // means changing the brand color later is a one-line edit.
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
        },
      },
    },
  },
  plugins: [],
};
