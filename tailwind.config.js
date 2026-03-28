/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kozhura: {
          orange: '#EA580C',
          text: '#6B6565',
          dark: '#1A1A1A',
          ink: '#1D1D20',
        },
      },
      fontFamily: {
        sans: ['"Yu Gothic UI Light"', '"Yu Gothic UI"', '"Yu Gothic"', 'Meiryo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
