/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solar': '#ff6300',      // Chama Solar
        'cosmic': '#8d0be7',     // Roxo Cósmico
        'vibrant': '#6be536',    // Verde Vibrante
        'mist': '#f7f7f7',       // Branco Névoa
        'deep-black': '#100d0d', // Preto Profundo
      },
    },
  },
  plugins: [],
}
