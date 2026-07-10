/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Cada degrau lê de uma variável CSS (definida em theme-variables.css)
        // em vez de um hex fixo. Isso é o que permite trocar o tema em
        // runtime, sem rebuild: o Tailwind gera `rgb(var(--color-accent-600) / 1)`,
        // e o valor de `--color-accent-600` muda conforme o `data-theme`
        // atual no <html>, controlado pelo ThemeContext.
        accent: {
          50: "rgb(var(--color-accent-50) / <alpha-value>)",
          100: "rgb(var(--color-accent-100) / <alpha-value>)",
          200: "rgb(var(--color-accent-200) / <alpha-value>)",
          300: "rgb(var(--color-accent-300) / <alpha-value>)",
          400: "rgb(var(--color-accent-400) / <alpha-value>)",
          500: "rgb(var(--color-accent-500) / <alpha-value>)",
          600: "rgb(var(--color-accent-600) / <alpha-value>)",
          700: "rgb(var(--color-accent-700) / <alpha-value>)",
          800: "rgb(var(--color-accent-800) / <alpha-value>)",
          900: "rgb(var(--color-accent-900) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};