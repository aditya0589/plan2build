/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          900: '#0B0D13',
          850: '#11141D',
          800: '#171B26',
          750: '#1E2332',
          700: '#252C3D',
          600: '#343E56',
          500: '#4F5D80',
          400: '#7E8CA8',
          300: '#AAB5CC',
          200: '#D3DAE8',
          100: '#EEF2F9',
        },
        accent: {
          blue: '#3B82F6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
